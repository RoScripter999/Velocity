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
import { openChangelogModal } from "@components/settings";
import { BackupAndRestoreTab, CloudTab, HelpersTab, PluginsTab, ThemesTab, UpdaterTab, VelocityTab } from "@components/settings/tabs";
import { IconCreator, IconsTab, TestTab } from "@components/settings/tabs/devtools";
import { ThemesLibTab } from "@components/settings/tabs/themeLibary";
import { Category, Custom, NestedPanel, Panel, Section, SidebarButton, TabItem } from "@components/userSettings";
import { Devs } from "@utils/constants";
import { isTruthy } from "@utils/guards";
import definePlugin, { OptionType } from "@utils/types";
import type { LayoutNode, SidebarItemNode } from "@velocity-types";
import { Buttons, Icons, Tooltip } from "@webpack/common";
import type { ComponentType, JSX, PropsWithChildren } from "react";

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

    wrapSectionTitle() {
        return (
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                Velocity Settings
                <Tooltip text="Changelog">
                    {tooltipProps => (
                        <Buttons.IconButton
                            onMouseEnter={tooltipProps.onMouseEnter}
                            onMouseLeave={tooltipProps.onMouseLeave}
                            onClick={() => openChangelogModal()}
                            icon={Icons.RetryIcon}
                            role="button"
                            variant="icon-only"
                            size="sm"
                        />
                    )}
                </Tooltip>
            </div>
        );
    },

    buildEntry(options: {
        key: string;
        title: string;
        panelTitle?: string;
        Component: ComponentType<{}>;
        Icon: ComponentType<any>;
    }): SidebarItemNode {
        const { key, title, panelTitle = title, Component, Icon } = options;
        return SidebarButton({
            key,
            title,
            icon: () => <Icon size="refresh_sm" color="currentColor" />,
            children: Panel({
                key: key + "_panel",
                title: panelTitle,
                children: Category({
                    key: key + "_category",
                    children: Custom({
                        key: key + "_custom",
                        Component: () => <Component />,
                        useSearchTerms: () => [title]
                    })
                })
            })
        });
    },

    buildLayout(originalLayoutBuilder: { key?: string; buildLayout(): LayoutNode[]; }) {
        const layout: (LayoutNode | JSX.Element)[] = originalLayoutBuilder.buildLayout();
        if (originalLayoutBuilder.key !== "$Root" || !Array.isArray(layout)) return layout;
        if (layout.some(s => s?.key === "velocity_section")) return layout;

        const velocityEntries: (SidebarItemNode | JSX.Element)[] = [
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
            <SidebarButton
                key="velocity_themes"
                title="Themes"
                icon={() => <Icons.PaintbrushThickIcon size="refresh_sm" color="currentColor" />}
            >
                <Panel key="themes_category_panel" title="Themes">
                    <Category key="themes_nested" title="Themes">
                        <NestedPanel
                            key="themes_nested_panel"
                            title="Theme Library"
                            subtitle="Download online themes directly from Discord"
                            useLeadingDecoration={() => ({ type: 0, icon: Icons.PaintPaletteIcon })}
                        >
                            <Panel key="themes_inner_panel" title="Theme Library">
                                <Category key="theme_lib_category" title="Theme Libary">
                                    <Custom Component={ThemesLibTab} />
                                </Category>
                            </Panel>
                        </NestedPanel>
                        <Custom Component={ThemesTab} />
                    </Category>
                </Panel>
            </SidebarButton>,
            !IS_UPDATER_DISABLED && UpdaterTab && this.buildEntry({
                key: "velocity_updater",
                title: "Updater",
                panelTitle: "Velocity Updater",
                Component: UpdaterTab,
                Icon: Icons.DownloadIcon
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
            IS_DEV && <SidebarButton key="velocity_developer_tools" title="Developer Tools" icon={Icons.ScienceIcon}>
                <Panel key="velocity_developer_tools_panel" title="Developer Tools">
                    <TabItem key="icons_preview" title="Icons Preview">
                        <Custom Component={IconsTab} />
                    </TabItem>
                    <TabItem key="icon_creator" title="Icon Creator">
                        <Custom Component={IconCreator} />
                    </TabItem>
                    <TabItem key="gay" title="GAY">
                        <Custom Component={TestTab} />
                    </TabItem>
                </Panel>
            </SidebarButton>,
            IS_DEV && HelpersTab && this.buildEntry({
                key: "velocity_helper",
                title: "Helpers",
                Component: HelpersTab,
                Icon: Icons.WrenchIcon
            }),
            ...this.customEntries
        ].filter(isTruthy);

        const velocitySection = <Section key="velocity_section" title={this.wrapSectionTitle()}>
            {velocityEntries}
        </Section>;

        const { settingsLocation } = settings.store;

        const places: Record<SettingsLocation, string> = {
            top: "user_section",
            aboveNitro: "billing_section",
            belowNitro: "billing_section",
            aboveActivity: "activity_section",
            belowActivity: "activity_section",
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
