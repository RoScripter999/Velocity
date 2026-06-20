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

import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { isPluginEnabled, isSettingDisabled, isSettingHidden, plugins } from "@api/PluginManager";
import { Settings, type ThemeDef, useSettings } from "@api/Settings";
import { openPluginModal, openSettingsTabModal, PluginsTab, ThemesTab } from "@components/settings";
import { openUIElementsModal } from "@components/settings/tabs/plugins/UIElements";
import { getIntlMessage } from "@utils/discord";
import { useAwaiter } from "@utils/react";
import { wordsFromCamel, wordsToTitle } from "@utils/text";
import { OptionType, type Plugin, type PluginSettingSelectOption } from "@utils/types";
import { Icons, Menu, showToast, useEffect, useMemo, useState } from "@webpack/common";
import type { ReactNode } from "react";

import { settings } from ".";

function buildPluginMenu() {
    const { showPluginMenu } = settings.use(["showPluginMenu"]);

    // has to be here due to hooks
    const pluginEntries = buildPluginMenuEntries();

    if (!showPluginMenu) return null;

    return (
        <Menu.MenuItem
            id="plugins"
            label="Plugins"
            action={() => openSettingsTabModal(PluginsTab)}
        >
            {pluginEntries}
        </Menu.MenuItem>
    );
}

export function buildPluginMenuEntries(includeEmpty = false) {
    const pluginSettings = useSettings().plugins;

    const [search, setSearch] = useState("");
    const [asyncOpts, setAsyncOpts] = useState<Record<string, PluginSettingSelectOption[]>>({});

    useEffect(() => {
        for (const plugin of Object.values(plugins)) {
            if (!isPluginEnabled(plugin.name) || !plugin.settings) continue;
            for (const [key, option] of Object.entries(plugin.settings.def)) {
                if (option.type !== OptionType.SELECT) continue;
                if (typeof option.options !== "function") continue;

                const mapKey = `${plugin.name}-${key}`;
                option.options().then(opts => setAsyncOpts(prev => ({ ...prev, [mapKey]: opts })));
            }
        }
    }, []);

    const lowerSearch = search.toLowerCase();

    const sortedPlugins = useMemo(() =>
        Object.values(plugins).sort((a, b) => a.name.localeCompare(b.name)),
        []
    );

    const candidates = useMemo(() =>
        sortedPlugins
            .filter(p => {
                if (!isPluginEnabled(p.name)) return false;
                if (p.name.endsWith("API")) return false;

                const name = p.name.toLowerCase();
                return name.includes(lowerSearch);
            }),
        [lowerSearch]
    );

    return (
        <>
            <Menu.MenuControlItem
                id="plugins-search"
                control={(props, ref) => (
                    <Menu.MenuSearchControl
                        {...props}
                        query={search}
                        onChange={setSearch}
                        ref={ref}
                    />
                )}
            />

            <Menu.MenuSeparator />

            {candidates
                .map(p => {
                    const options = [] as ReactNode[];

                    let hasAnyOption = false;

                    if (p.settings) for (const [key, option] of Object.entries(p.settings.def)) {
                        if (isSettingHidden(p.settings, option)) continue;

                        hasAnyOption = true;

                        const s = pluginSettings[p.name];

                        const baseProps = {
                            id: `${p.name}-${key}`,
                            key: key,
                            label: ("displayName" in option ? option.displayName : undefined) ?? wordsToTitle(wordsFromCamel(key)),
                            disabled: isSettingDisabled(p.settings, option)
                        };

                        switch (option.type) {
                            case OptionType.BOOLEAN:
                                options.push(
                                    <Menu.MenuCheckboxItem
                                        {...baseProps}
                                        checked={s[key]}
                                        action={() => {
                                            s[key] = !s[key];
                                            if (option.restartNeeded) showToast("Restart to apply the change");
                                        }}
                                    />
                                );
                                break;

                            case OptionType.SELECT: {
                                const mapKey = `${p.name}-${key}`;
                                const opts = Array.isArray(option.options)
                                    ? [...option.options]
                                    : (asyncOpts[mapKey] ?? []);

                                if (opts.length === 0) {
                                    options.push(
                                        <Menu.MenuItem
                                            {...baseProps}
                                            key={key}
                                            label={baseProps.label + " (loading)"}
                                        />
                                    );
                                    break;
                                }

                                const isMulti = Array.isArray(s[key]) || Array.isArray(option.default);
                                options.push(
                                    <Menu.MenuItem {...baseProps} key={key}>
                                        {opts.map(opt => {
                                            if (isMulti) {
                                                const current: unknown[] = s[key] ?? [];
                                                return (
                                                    <Menu.MenuCheckboxItem
                                                        id={`${p.name}-${key}-${opt.value}`}
                                                        key={String(opt.value)}
                                                        label={opt.label}
                                                        checked={current.includes(opt.value)}
                                                        action={() => {
                                                            const cur: unknown[] = s[key] ?? [];
                                                            s[key] = cur.includes(opt.value)
                                                                ? cur.filter(v => v !== opt.value)
                                                                : [...cur, opt.value];
                                                            if (option.restartNeeded) showToast("Restart to apply the change");
                                                        }}
                                                    />
                                                );
                                            }
                                            return (
                                                <Menu.MenuRadioItem
                                                    group={`${p.name}-${key}`}
                                                    id={`${p.name}-${key}-${opt.value}`}
                                                    key={String(opt.value)}
                                                    label={opt.label}
                                                    checked={s[key] === opt.value}
                                                    action={() => {
                                                        s[key] = opt.value;
                                                        if (option.restartNeeded) showToast("Restart to apply the change");
                                                    }}
                                                />
                                            );
                                        })}
                                    </Menu.MenuItem>
                                );
                                break;
                            }

                            case OptionType.SLIDER:
                                if (option.stickToMarkers || option.componentProps) continue;

                                options.push(
                                    <Menu.MenuControlItem
                                        {...baseProps}
                                        control={(props, ref) => (
                                            <Menu.MenuSliderControl
                                                ref={ref}
                                                {...props}
                                                minValue={option.markers[0]}
                                                maxValue={option.markers.at(-1)!}
                                                value={s[key]}
                                                onChange={v => s[key] = v}
                                            />
                                        )}
                                    />
                                );
                                break;
                        }
                    }

                    const hasVisibleOptions = options.length > 0;
                    const shouldSkip = !hasVisibleOptions && !(includeEmpty && hasAnyOption);
                    if (shouldSkip) return null;

                    return (
                        <Menu.MenuItem
                            id={`${p.name}-menu`}
                            key={p.name}
                            label={p.name}
                            action={() => openPluginModal(p)}
                        >
                            {hasVisibleOptions && (
                                <>
                                    <Menu.MenuGroup label={p.name}>
                                        {options}
                                    </Menu.MenuGroup>

                                    <Menu.MenuSeparator />
                                    <Menu.MenuItem
                                        id={`${p.name}-open`}
                                        label={getIntlMessage("OPEN_SETTINGS")}
                                        leadingAccessory={{
                                            type: "icon",
                                            icon: Icons.SettingsIcon
                                        }}
                                        icon={Icons.SettingsIcon}
                                        action={() => openPluginModal(p)}
                                    />
                                </>
                            )}
                        </Menu.MenuItem>
                    );
                })
            }
        </>
    );
}

export function buildThemeMenu() {
    return (
        <Menu.MenuItem
            id="themes"
            label="Themes"
            action={() => openSettingsTabModal(ThemesTab)}
        >
            {buildThemeMenuEntries()}
        </Menu.MenuItem>
    );
}

export function buildThemeMenuEntries() {
    const { useQuickCss, themes: Theme } = useSettings(["useQuickCss", "themes.*"]);

    const [themes] = useAwaiter(VelocityNative.themes.getThemesList);

    return (
        <>
            <Menu.MenuCheckboxItem
                id="toggle-quickcss"
                checked={useQuickCss}
                label={"Enable QuickCSS"}
                action={() => {
                    Settings.useQuickCss = !useQuickCss;
                }}
            />
            <Menu.MenuItem
                id="edit-quickcss"
                label="Edit QuickCSS"
                action={() => VelocityNative.quickCss.openEditor()}
            />
            <Menu.MenuItem
                id="manage-themes"
                label="Manage Themes"
                action={() => openSettingsTabModal(ThemesTab)}
            />
            {!!themes?.length && (
                <Menu.MenuGroup>
                    {themes.map(theme => (
                        <Menu.MenuCheckboxItem
                            id={`theme-${theme.fileName}`}
                            key={theme.fileName}
                            label={theme.name}
                            checked={Theme.localThemes?.some(t => t.name === theme.fileName)}
                            action={() => {
                                const enabled = Theme.localThemes;
                                const exists = enabled.some(t => t.name === theme.fileName);
                                const strip = (t: ThemeDef) => ({ name: String(t.name), themeActivationModes: t.themeActivationModes });

                                Theme.localThemes = exists
                                    ? enabled.filter(t => t.name !== theme.fileName).map(strip)
                                    : [...enabled.map(strip), { name: theme.fileName, themeActivationModes: "always" }];
                            }}
                        />
                    ))}
                </Menu.MenuGroup>
            )}
        </>
    );
}

function buildCustomPluginEntries() {
    const pluginEntries = [] as { plugin: Plugin, node: ReactNode; }[];

    for (const plugin of Object.values(plugins)) {
        if (plugin.toolboxActions && isPluginEnabled(plugin.name)) {
            const entries = typeof plugin.toolboxActions === "function"
                ? plugin.toolboxActions()
                : Object.entries(plugin.toolboxActions).map(([text, action]) => {
                    const key = `${plugin.name}-${text}`;
                    return (
                        <Menu.MenuItem
                            id={key}
                            key={key}
                            label={text}
                            action={action}
                        />
                    );
                });

            if (!entries || (Array.isArray(entries) && entries.length === 0)) continue;

            pluginEntries.push({
                plugin,
                node: (
                    <Menu.MenuGroup label={plugin.name} key={`${plugin.name}-group`}>
                        {entries}
                    </Menu.MenuGroup>
                )
            });
        }
    }

    if (pluginEntries.length <= 5)
        return pluginEntries.map(e => e.node);

    const submenuEntries = pluginEntries.map(({ node, plugin }) => (
        <Menu.MenuItem
            id={`${plugin.name}-menu`}
            key={`${plugin.name}-menu`}
            label={plugin.name}
            action={() => openPluginModal(plugin)}
        >
            {node}
        </Menu.MenuItem>
    ));

    return <Menu.MenuGroup>{submenuEntries}</Menu.MenuGroup>;
}

export function renderPopout(onClose: () => void) {
    return (
        <Menu.Menu
            navId="vc-toolbox"
            onClose={onClose}
        >
            <Menu.MenuItem
                id="notifications"
                label="Open Notification Log"
                action={openNotificationLogModal}
            />
            <Menu.MenuItem
                id="ui_elements"
                label="Open UIElements Settings"
                action={openUIElementsModal}
            />

            {buildThemeMenu()}
            {buildPluginMenu()}

            {buildCustomPluginEntries()}
        </Menu.Menu>
    );
}
