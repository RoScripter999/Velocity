/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 RoScripter999 and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { disableStyle, enableStyle } from "@api/Styles";
import { VelocityIcon } from "@components/Icons";
import { buildPluginMenuEntries, buildThemeMenuEntries } from "@plugins/velocityToolbox/menu";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getIntlMessage } from "@utils/discord";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { findCssClassesLazy } from "@webpack";
import { ComponentDispatch, FocusLock, Icons, Menu, useEffect, useRef } from "@webpack/common";
import type { ComponentType, HTMLAttributes, ReactNode } from "react";

import fullHeightStyle from "./fullHeightContext.css?managed";

const cl = classNameFactory("");
const Classes = findCssClassesLazy("animating", "baseLayer", "bg", "layer", "layers");

const settings = definePluginSettings({
    disableFade: {
        description: "Disable the crossfade animation",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    },
    organizeMenu: {
        description: "Organizes the settings cog context menu into categories",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    },
    eagerLoad: {
        description: "Removes the loading delay when opening the menu for the first time",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    }
});

const SECTION_ICONS = (): Record<string, ComponentType<any>> => ({
    user_section: Icons.SettingsIcon,
    velocity_section: VelocityIcon,
    billing_section: Icons.CreditCardIcon,
    app_section: Icons.AppsIcon,
    activity_section: Icons.GameControllerIcon,
    developer_section: Icons.StaffBadgeIcon
});


interface LayerProps extends HTMLAttributes<HTMLDivElement> {
    mode: "SHOWN" | "HIDDEN";
    baseLayer?: boolean;
}

function Layer({ mode, baseLayer = false, ...props }: LayerProps) {
    const hidden = mode === "HIDDEN";
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => () => {
        ComponentDispatch.dispatch("LAYER_POP_START");
        ComponentDispatch.dispatch("LAYER_POP_COMPLETE");
    }, []);

    const node = (
        <div
            ref={containerRef}
            aria-hidden={hidden}
            className={cl({
                [Classes.layer]: true,
                [Classes.baseLayer]: baseLayer,
                "stop-animations": hidden
            })}
            style={{ opacity: hidden ? 0 : undefined }}
            {...props}
        />
    );

    return baseLayer
        ? node
        : <FocusLock containerRef={containerRef}>{node}</FocusLock>;
}

export default definePlugin({
    name: "BetterSettings",
    description: "Enhances your settings-menu-opening experience",
    tags: ["Appearance", "Customisation", "Organisation"],
    authors: [Devs.Kyuuhachi],
    settings,

    start() {
        if (settings.store.organizeMenu)
            enableStyle(fullHeightStyle);
    },

    stop() {
        disableStyle(fullHeightStyle);
    },

    patches: [
        {
            find: "this.renderArtisanalHack()",
            replacement: [
                {
                    match: /class (\i)( extends \i\.PureComponent.+?jsx\)\(\1,\{mode:)/,
                    replace: "var $1=$self.Layer;class VelocityPatchedOldFadeLayer$2",
                    predicate: () => settings.store.disableFade
                },
                { // Lazy-load contents
                    match: /createPromise:\(\)=>([^:}]*?),webpackId:"?\d+"?,name:(?!="CollectiblesShop")"[^"]+"/g,
                    replace: "$&,_:$1",
                    predicate: () => settings.store.eagerLoad
                }
            ]
        },
        { // For some reason standardSidebarView also has a small fade-in
            find: 'minimal:"contentColumnMinimal"',
            replacement: [
                {
                    match: /(?=\(0,\i\.\i\)\((\i),\{from:\{position:"absolute")/,
                    replace: "(_cb=>_cb(void 0,$1))||"
                },
                {
                    match: /\i\.animated\.div/,
                    replace: '"div"'
                }
            ],
            predicate: () => settings.store.disableFade
        },
        { // Disable fade animations for settings menu
            find: '"data-mana-component":"layer-modal"',
            lazy: true,
            replacement: [
                {
                    match: /(\i)\.animated\.div(?=,\{"data-mana-component":"layer-modal")/,
                    replace: '"div"'
                },
                {
                    match: /(?<="data-mana-component":"layer-modal"[^}]*?)style:\i,/,
                    replace: "style:{},"
                }
            ],
            predicate: () => settings.store.disableFade
        },
        { // Disable initial and exit delay for settings menu
            find: "headerId:void 0,headerIdIsManaged:!1",
            replacement: {
                match: /let (\i)=300/,
                replace: "let $1=0"
            },
            predicate: () => settings.store.disableFade
        },
        { // Load menu TOC eagerly
            find: "handleOpenSettingsContextMenu=",
            replacement: {
                match: /(?=handleOpenSettingsContextMenu=.{0,100}?null!=\i&&.{0,100}?(await [^};]*?\)\)))/,
                replace: "_velocityBetterSettingsEagerLoad=(async ()=>$1)();"
            },
            predicate: () => settings.store.eagerLoad
        },
        { // Settings cog context menu
            find: "#{intl::USER_SETTINGS_ACTIONS_MENU_LABEL}",
            predicate: () => settings.store.organizeMenu,
            lazy: true,
            replacement: {
                match: /children:\[(\i),null!=(\i).{0,30}\}\),(\i)\](?<=\1=(?:function|.{0,30}\.openUserSettings).+?)/, // TODO .{0,30}\.openUserSettings is stable compat
                replace: "children:$self.transformSettingsEntries([$1,$2,$3])"
            }

        },
        {
            find: "USER_SECTION,",
            lazy: true,
            replacement: {
                match: /(USER_SECTION,\{)/,
                replace: "$1useTitle:()=>Velocity.Util.getIntlMessage('USER_SETTINGS'),"
            }
        }
    ],

    // This is the very outer layer of the entire ui, so we can't wrap this in an ErrorBoundary
    // without possibly also catching unrelated errors of children.
    //
    // Thus, we sanity check webpack modules
    Layer(props: LayerProps) {
        try {
            [FocusLock.$$velocityGetWrappedComponent(), ComponentDispatch, Classes.layer].forEach(e => e.test);
        } catch {
            new Logger("BetterSettings").error("Failed to find some components");
            return props.children;
        }

        return <Layer {...props} />;
    },

    transformSettingsEntries(list) {
        const items: ReactNode[] = [];
        const SECTION_NAMES: Record<string, string> = {
            user_section: getIntlMessage("USER_SETTINGS")
        };

        const flat = list.flat(Infinity);

        for (const item of flat) {
            if (!item?.props) continue;
            const { key, props } = item;

            if (key === "velocity_plugins" || key === "velocity_themes") {
                const children = key === "velocity_plugins"
                    ? buildPluginMenuEntries()
                    : buildThemeMenuEntries();

                items.push(
                    <Menu.MenuItem key={key} id={key} label={props.label} {...props}>
                        {children}
                    </Menu.MenuItem>
                );
            } else if ((key?.endsWith("_section")) && (props.label ?? SECTION_NAMES[key])) {
                const iconLeft = SECTION_ICONS()[key];

                items.push(
                    <Menu.MenuItem
                        key={key}
                        label={props.label ?? SECTION_NAMES[key]}
                        id={props.label ?? SECTION_NAMES[key]}
                        {...(iconLeft && { iconLeft })}
                    >
                        {this.transformSettingsEntries(props.children)}
                    </Menu.MenuItem>
                );
            } else {
                items.push(item);
            }
        }

        return items;
    }
});
