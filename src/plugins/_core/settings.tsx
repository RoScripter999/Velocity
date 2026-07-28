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
import { PluginsIcon, VelocityIcon } from "@components/Icons";
import { BackupAndRestoreTab, ChangeLogTab, CloudTab, DevTools, HelpersTab, PluginsTab, ThemesTab, UpdaterTab, VelocityTab } from "@components/settings/tabs";
import { ThemesLibTab } from "@components/settings/tabs/themeLibary";
import { Devs } from "@utils/constants";
import { isTruthy } from "@utils/guards";
import definePlugin, { OptionType } from "@utils/types";
import type { LayoutNode, PanelNode, SectionNode, SidebarItemNode } from "@velocity-types";
import { LayoutType, NestedPanelLeadingDecorationType } from "@velocity-types/enums";
import { Icons } from "@webpack/common";
import type { ComponentType, PropsWithChildren } from "react";

import gitHash from "~git-hash";

type SettingsLocation =
    | "top"
    | "aboveNitro"
    | "belowNitro"
    | "aboveActivity"
    | "belowActivity"
    | "bottom";

const settings = definePluginSettings({
    settingsLocation: {
        type: OptionType.SELECT,
        description: "Where to put the Velocity settings section",
        options: [
            { label: "At the very top", value: "top" },
            { label: "Above the Nitro section", value: "aboveNitro", default: true },
            { label: "Below the Nitro section", value: "belowNitro" },
            { label: "Above Activity Settings", value: "aboveActivity" },
            { label: "Below Activity Settings", value: "belowActivity" },
            { label: "At the very bottom", value: "bottom" }
        ]
    },
    includeClientInfoWhenCopying: {
        type: OptionType.BOOLEAN,
        description: "Also copy Velocity info (Velocity, Electron, Chromium) when clicking the version info in the bottom left area of the Settings page",
        default: true
    }
});

export default definePlugin({
    name: "Settings",
    description: "Adds Settings UI and debug info",
    authors: [Devs.RoScripter999],
    required: true,

    settings,
    patches: [
        {
            find: "#{intl::COPY_VERSION}",
            lazy: true,
            replacement: [
                {
                    match: /"text-xxs\/normal".{0,300}?(?=null!=(\i)&&(.{0,20}\i\.\i.{0,200}?,children:).{0,15}?("span"),({className:\i\.\i,children:\["Build Override: ",\1\.id\]\})\)\}\))/,
                    replace: (m, _buildOverride, makeRow, component, props) => {
                        props = props.replace(/children:\[.+\]/, "");
                        return `${m},$self.makeInfoElements(${component},${props}).map(e=>${makeRow}e})),`;
                    }
                },
                {
                    match: /copyValue:\i\.join\(" "\)/g,
                    replace: "$& + $self.getInfoString()"
                }
            ]
        },
        {
            find: ".buildLayout().map",
            lazy: true,
            replacement: {
                match: /(\i)\.buildLayout\(\)(?=\.map)/,
                replace: "$self.buildLayout($1)"
            }
        }
    ],

    buildEntry(options: {
        key: string;
        title: string;
        panelTitle?: string;
        Component: ComponentType<{}>;
        Icon: ComponentType<any>;
    }): SidebarItemNode {
        const { key, title, panelTitle = title, Component, Icon } = options;

        const panel: PanelNode = {
            key: key + "_panel",
            type: LayoutType.PANEL,
            useTitle: () => panelTitle,
            buildLayout: () => [{
                type: LayoutType.CATEGORY,
                key: key + "_category",
                layout: [{
                    type: LayoutType.CUSTOM,
                    key: key + "_custom",
                    Component: () => <Component />,
                    useSearchTerms: () => [title]
                }]
            }]
        };

        return {
            key,
            type: LayoutType.SIDEBAR_ITEM,
            useTitle: () => title,
            icon: () => <Icon size="refresh_sm" color="currentColor" />,
            buildLayout: () => [panel]
        };
    },

    buildLayout(originalLayoutBuilder: { key?: string; buildLayout(): LayoutNode[]; }) {
        const layout = originalLayoutBuilder.buildLayout();
        if (originalLayoutBuilder.key !== "$Root" || !Array.isArray(layout)) return layout;
        if (layout.some(s => s?.key === "velocity_section")) return layout;

        const velocityEntries: SidebarItemNode[] = [
            this.buildEntry({
                key: "velocity_main",
                title: "Velocity",
                panelTitle: "Velocity Settings",
                Component: VelocityTab,
                Icon: VelocityIcon
            }),
            this.buildEntry({
                key: "velocity_plugins",
                title: "Plugins",
                Component: PluginsTab,
                Icon: PluginsIcon
            }),

            {
                key: "velocity_themes",
                type: LayoutType.SIDEBAR_ITEM,
                useTitle: () => "Themes",
                icon: () => <Icons.PaintbrushThickIcon size="refresh_sm" color="currentColor" />,
                buildLayout: () => [
                    {
                        key: "themes_panel",
                        type: LayoutType.PANEL,
                        useTitle: () => "Themes",
                        buildLayout: () => [
                            {
                                key: "themes_category",
                                type: LayoutType.CATEGORY,
                                useTitle: () => "Themes",
                                buildLayout: () => [
                                    !IS_USERSCRIPT && {
                                        key: "themes_lib_panel_nav",
                                        type: LayoutType.NESTED_PANEL_NAVIGATOR,
                                        useTitle: () => "Theme Library",
                                        useSubtitle: () => "Download online themes directly from Discord",
                                        useLeadingDecoration: () => ({
                                            type: NestedPanelLeadingDecorationType.ICON,
                                            icon: Icons.PaintPaletteIcon
                                        }),

                                        buildLayout: () => [
                                            {
                                                key: "themes_lib_panel",
                                                type: LayoutType.PANEL,
                                                useTitle: () => "Theme Library",
                                                buildLayout: () => [
                                                    {
                                                        key: "themes_lib_category",
                                                        type: LayoutType.CATEGORY,
                                                        useTitle: () => "Theme Libary",
                                                        buildLayout: () => [{
                                                            type: LayoutType.CUSTOM,
                                                            Component: ThemesLibTab
                                                        }]
                                                    }

                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        key: "themes_tab",
                                        type: LayoutType.CUSTOM,
                                        Component: ThemesTab
                                    }
                                ].filter(isTruthy)
                            }
                        ]
                    }
                ]
            } as SidebarItemNode,
            !IS_UPDATER_DISABLED && UpdaterTab && this.buildEntry({
                key: "velocity_updater",
                title: "Updater",
                panelTitle: "Velocity Updater",
                Component: UpdaterTab,
                Icon: Icons.DownloadIcon
            }),
            this.buildEntry({
                key: "velocity_changelog",
                title: "Changelog",
                panelTitle: "Velocity Changelog",
                Component: ChangeLogTab,
                Icon: Icons.TopicsIcon
            }),
            this.buildEntry({
                key: "velocity_cloud",
                title: "Cloud",
                panelTitle: "Velocity Cloud",
                Component: CloudTab,
                Icon: Icons.CloudIcon
            }),
            this.buildEntry({
                key: "velocity_backup_restore",
                title: "Backup & Restore",
                Component: BackupAndRestoreTab,
                Icon: Icons.RefreshIcon
            }),
            IS_DEV && DevTools?.(),
            IS_DEV && HelpersTab?.(),
            ...this.customEntries
        ].filter(isTruthy);

        const velocitySection: SectionNode = {
            key: "velocity_section",
            type: LayoutType.SECTION,
            useTitle: () => "Velocity Settings",
            buildLayout: () => velocityEntries
        };

        const { settingsLocation } = settings.store;

        const places: Record<SettingsLocation, string> = {
            top: "user_section",
            aboveNitro: "billing_section",
            belowNitro: "billing_section",
            aboveActivity: "games_and_apps_section",
            belowActivity: "games_and_apps_section",
            bottom: "utility_section"
        };

        const key = places[settingsLocation] ?? places.top;
        let idx = layout.findIndex(s => typeof s?.key === "string" && s.key === key);

        if (idx === -1) {
            idx = 2;
        } else if (settingsLocation.startsWith("below")) {
            idx += 1;
        }

        layout.splice(idx, 0, velocitySection);

        return layout;
    },

    customEntries: [] as SidebarItemNode[],

    get electronVersion() {
        return VelocityNative.native.getVersions().electron || null;
    },

    get chromiumVersion() {
        try {
            return VelocityNative.native.getVersions().chrome
                // @ts-expect-error Typescript will add userAgentData IMMEDIATELY
                || navigator.userAgentData?.brands?.find(b => b.brand === "Chromium" || b.brand === "Google Chrome")?.version
                || null;
        } catch { // inb4 some stupid browser throws unsupported error for navigator.userAgentData, it's only in chromium
            return null;
        }
    },

    get additionalInfo() {
        if (IS_DEV) return " (Dev)";
        if (IS_STANDALONE) return " (Standalone)";
        return "";
    },

    getInfoRows() {
        const { electronVersion, chromiumVersion, additionalInfo } = this;

        const rows = [`Velocity ${gitHash}${additionalInfo}`];

        if (electronVersion) rows.push(`Electron ${electronVersion}`);
        if (chromiumVersion) rows.push(`Chromium ${chromiumVersion}`);

        return rows;
    },

    getInfoString() {
        if (!settings.store.includeClientInfoWhenCopying) return "";
        return "\n" + this.getInfoRows().join("\n");
    },

    makeInfoElements(Component: ComponentType<PropsWithChildren>, props: PropsWithChildren) {
        return this.getInfoRows().map((text, i) =>
            <Component key={i} {...props}>{text}</Component>
        );
    }
});
