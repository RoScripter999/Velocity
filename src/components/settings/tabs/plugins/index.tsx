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

import "./styles.css";

import * as DataStore from "@api/DataStore";
import { isPluginEnabled } from "@api/PluginManager";
import { Settings, useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import ErrorBoundary from "@components/ErrorBoundary";
import { HeadingTertiary } from "@components/Heading";
import { Link } from "@components/Link";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { SectionHeader, SettingsTab } from "@components/settings";
import { ChangeList } from "@utils/ChangeList";
import { classNameFactory } from "@utils/css";
import { isTruthy } from "@utils/guards";
import { Logger } from "@utils/Logger";
import { classes, isPluginDev } from "@utils/misc";
import { useAwaiter, useCleanupEffect, useIntersection } from "@utils/react";
import { type PluginTag, PluginTags } from "@utils/types";
import { Buttons, ConfirmModal, Field, Forms, HelpMessage, Icons, LoadingIndicator, openModal, Parser, SearchableSelect, SearchBar, Select, Text, useCallback, useDeferredValue, useEffect, useMemo, useRef, UserStore, useState } from "@webpack/common";

import Plugins, { ExcludedPlugins, PluginMeta } from "~plugins";

import { openContributorModal } from "./ContributorModal";
import { PluginCard } from "./PluginCard";
import { UIElementsButton } from "./UIElements";

export const cl = classNameFactory("vc-plugins-");
export const logger = new Logger("PluginSettings", "#a6d189");

const enum SearchStatus {
    ALL,
    ENABLED,
    DISABLED,
    NEW,
    USER_PLUGINS,
    API_PLUGINS
}

const enum SortMode {
    ALPHABETICAL,
    ENABLED,
    DISABLED,
    HAS_SETTINGS
}

type PluginFilters = {
    value: string;
    tags: PluginTag[];
    status: SearchStatus;
    sortBy: SortMode;
};

const defaultFilters: PluginFilters = {
    value: "",
    tags: [],
    status: SearchStatus.ALL,
    sortBy: SortMode.ALPHABETICAL
};

function ReloadRequiredCard({ required }: { required: boolean; }) {
    return (
        <>
            {required ? (
                <Card type={Card.Types.WARNING}>
                    <Forms.FormTitle>Restart required!</Forms.FormTitle>
                    <Paragraph style={{ marginBottom: 8 }}>
                        Restart now to apply new plugins and their settings
                    </Paragraph>
                    <Buttons.Button
                        icon={Icons.RefreshIcon}
                        text="Restart Discord (Ctrl + R)"
                        variant="secondary"
                        onClick={() => location.reload()}
                        fullWidth
                    />
                </Card>
            ) : (
                <>
                    <Field
                        label="All official built-in velocity plugins will be displayed here."
                        description="Click the Gear icon to modify a plugin's settings."
                    />
                    <div className={cl("tip-message")}>
                        <Text variant="text-sm/bold" color="text-brand">TIP</Text>
                        <Text variant="text-sm/semibold">You can share plugins with people by typing:</Text>
                        <code>velocity://plugins/PLUGIN_NAME</code>
                    </div>
                    <Forms.FormDivider className={Margins.top8} />
                </>
            )}
        </>
    );
}

function DevNotice() {
    const user = UserStore.getCurrentUser();
    const isDev = isPluginDev(user?.id);

    return (
        <>
            {isDev && (
                <HelpMessage messageType="info" className={cl("dev-notice")}>
                    See what plugins you've contributed to{" "}
                    <Link onClick={() => openContributorModal(user)} style={{ textDecoration: "underline" }}>
                        here
                    </Link>.
                </HelpMessage>
            )}
        </>
    );
}

function ExcludedPluginsList({ search }: { search: string; }) {
    const matchingExcludedPlugins = Object.entries(ExcludedPlugins).filter(([name]) =>
        name.toLowerCase().includes(search)
    );

    const ExcludedReasons: Record<string, string> = {
        desktop: "Discord Desktop app",
        discordDesktop: "Discord Desktop app",
        web: "Web version of Discord",
        dev: "Developer version of Velocity"
    };

    return (
        <>
            {matchingExcludedPlugins.length ? (
                <Paragraph className={Margins.top16}>
                    <Paragraph>Are you looking for:</Paragraph>
                    <ul>
                        {matchingExcludedPlugins.map(([name, reason]) => (
                            <li key={name}>
                                <b>{name}</b>: Only available on the {ExcludedReasons[reason]}
                            </li>
                        ))}
                    </ul>
                </Paragraph>
            ) : (
                <Text variant="eyebrow" className={Margins.top16}>No plugins meet the search criteria</Text>
            )}
        </>
    );
}

function applySortMode(plugins: { plugin: typeof Plugins[keyof typeof Plugins]; isRequired: boolean; isNew: boolean; }[], sortBy: SortMode): typeof plugins {
    return [...plugins].sort((a, b) => {
        const aEnabled = isPluginEnabled(a.plugin.name);
        const bEnabled = isPluginEnabled(b.plugin.name);
        const aHasSettings = !!a.plugin.settings && Object.keys(a.plugin.settings).length > 0;
        const bHasSettings = !!b.plugin.settings && Object.keys(b.plugin.settings).length > 0;

        if (sortBy === SortMode.ENABLED && aEnabled !== bEnabled) return aEnabled ? -1 : 1;
        if (sortBy === SortMode.DISABLED && aEnabled !== bEnabled) return aEnabled ? 1 : -1;
        if (sortBy === SortMode.HAS_SETTINGS && aHasSettings !== bHasSettings) return aHasSettings ? -1 : 1;

        return a.plugin.name.localeCompare(b.plugin.name);
    });
}

export default function PluginSettings() {
    const changeRef = useRef<ChangeList<string>>(null);
    const changes = changeRef.current ??= new ChangeList<string>();

    const depMap = useMemo(() => {
        const o = {} as Record<string, string[]>;
        for (const plugin in Plugins) {
            const deps = Plugins[plugin].dependencies;
            if (deps) {
                for (const dep of deps) {
                    o[dep] ??= [];
                    o[dep].push(plugin);
                }
            }
        }
        return o;
    }, []);

    const sortedPlugins = useMemo(() =>
        Object.values(Plugins).sort((a, b) => a.name.localeCompare(b.name)),
        []
    );

    const { changelog } = useSettings(["changelog.*"]);
    const newPlugins = useMemo(() => {
        const known = changelog.knownPlugins || {};
        const now = Math.floor(Date.now() / 1000);
        const time = 1 * 24 * 60 * 60; // 1 day bruh

        return sortedPlugins
            .map(plugin => plugin.name)
            .filter(name => {
                const ts = known[name];
                if (ts === undefined) return true;
                return (now - ts) < time;
            });
    }, [changelog.knownPlugins, sortedPlugins]);

    const hasUserPlugins = useMemo(() => Object.values(PluginMeta).some(m => m.userPlugin), []);

    const [savedFilters, , filtersLoading] = useAwaiter(() =>
        DataStore.get("Velocity_pluginFilters").then((saved: Partial<PluginFilters> | undefined) => saved && ({
            value: saved.value ?? "",
            tags: saved.tags ?? [],
            status: saved.status ?? SearchStatus.ALL,
            sortBy: saved.sortBy ?? SortMode.ALPHABETICAL
        }))
    );

    const filtersRef = useRef<PluginFilters>(defaultFilters);
    const [filters, setFilters] = useState<PluginFilters>(defaultFilters);

    const [restartRequired, setRestartRequired] = useState(false);
    const [visibleCount, setVisibleCount] = useState(20);
    const deferredSearch = useDeferredValue(filters.value);

    const filtersReady = !filtersLoading || filters !== defaultFilters;

    useEffect(() => {
        if (savedFilters != null) {
            filtersRef.current = savedFilters;
            setFilters(savedFilters);
        }
    }, [savedFilters]);

    const updateFilters = useCallback((updater: (previous: PluginFilters) => PluginFilters) => {
        setVisibleCount(20);
        setFilters(prev => {
            const next = updater(prev);
            filtersRef.current = next;
            return next;
        });
    }, []);

    const search = deferredSearch.toLowerCase();

    const pluginFilter = useCallback((plugin: typeof Plugins[keyof typeof Plugins]) => {
        const { status, tags } = filters;
        const enabled = isPluginEnabled(plugin.name);

        switch (status) {
            case SearchStatus.DISABLED: if (enabled) return false; break;
            case SearchStatus.ENABLED: if (!enabled) return false; break;
            case SearchStatus.NEW: if (!newPlugins?.includes(plugin.name)) return false; break;
            case SearchStatus.USER_PLUGINS: if (!PluginMeta[plugin.name]?.userPlugin) return false; break;
            case SearchStatus.API_PLUGINS: if (!plugin.name.endsWith("API")) return false; break;
        }

        if (tags.length && tags.some(t => !plugin.tags?.includes(t))) return false;

        const query = search.trim();
        if (!query.length) return true;

        switch (true) {
            case plugin.name.toLowerCase().includes(query):
            case typeof plugin.description === "string" && plugin.description.toLowerCase().includes(query):
            case plugin.name.match(/[A-Z]/g)?.join("").toLowerCase().includes(search):
            case plugin.searchTerms?.some(t => t.toLowerCase().includes(query)):
                return true;
            default:
                return false;
        }
    }, [filters, newPlugins, search]);

    const onRestartNeeded = useCallback((name: string, key: string) => {
        changes.handleChange(`${name}.${key}`);
        setRestartRequired(changes.hasChanges);
    }, [changes]);

    const [pluginsData, requiredPluginsData] = useMemo(() => {
        const plugins = [] as any[];
        const requiredPlugins = [] as any[];

        for (const p of sortedPlugins) {
            if (p.hidden || (p.name.endsWith("API") && filters.status !== SearchStatus.API_PLUGINS))
                continue;

            if (!pluginFilter(p)) continue;

            const isRequired = p.required || p.isDependency || depMap[p.name]?.some(d => Settings.plugins[d].enabled);
            const data = {
                plugin: p,
                isRequired,
                isNew: !isRequired && newPlugins?.includes(p.name)
            };

            (isRequired ? requiredPlugins : plugins).push(data);
        }

        const sortedData = applySortMode(plugins, filters.sortBy);

        return [sortedData, requiredPlugins];
    }, [filters, newPlugins, depMap, sortedPlugins, pluginFilter]);

    const plugins = useMemo(() => pluginsData.map(d => (
        <PluginCard
            onRestartNeeded={onRestartNeeded}
            disabled={d.isRequired}
            plugin={d.plugin}
            isNew={d.isNew}
            key={d.plugin.name}
        />
    )), [pluginsData, onRestartNeeded]);

    const requiredPlugins = useMemo(() => requiredPluginsData.map(d => (
        <PluginCard
            onRestartNeeded={onRestartNeeded}
            disabled={d.isRequired}
            plugin={d.plugin}
            isNew={d.isNew}
            key={d.plugin.name}
        />
    )), [requiredPluginsData, onRestartNeeded]);

    const [loaderRef, isIntersecting] = useIntersection();

    useEffect(() => {
        if (isIntersecting) {
            requestAnimationFrame(() => {
                setVisibleCount(c => Math.min(c + 20, plugins.length));
            });
        }
    }, [isIntersecting, plugins.length, filtersReady]);

    useCleanupEffect(() => {
        void DataStore.set("Velocity_pluginFilters", filtersRef.current);

        // Update known plugins map with current timestamps when the tab exits
        try {
            const currentPlugins = Object.keys(Plugins);
            const known = { ...Settings.changelog.knownPlugins };
            const now = Math.floor(Date.now() / 1000);
            let changed = false;

            for (const p of currentPlugins) {
                if (known[p] === undefined) {
                    known[p] = now;
                    changed = true;
                }
            }

            if (changed) {
                Settings.changelog.knownPlugins = known;
            }
        } catch (e) {
            logger.error("Failed to update known plugins in settings", e);
        }

        if (changes?.hasChanges) {
            openModal(props => (
                <ConfirmModal
                    {...props}
                    title="Restart required"
                    confirmText="Restart now"
                    cancelText="Later!"
                    variant="primary"
                    onConfirm={() => location.reload()}
                >
                    <div>
                        <p>The following plugins require a restart:</p>
                        <div>
                            {changes.map((s, i) => (
                                <span key={s}>
                                    {i > 0 && ", "}
                                    {Parser.parse("`" + s.split(".")[0] + "`")}
                                </span>
                            ))}
                        </div>
                    </div>
                </ConfirmModal>
            ));
        }
    }, []);

    return (
        <SettingsTab>
            <ReloadRequiredCard required={restartRequired} />
            <UIElementsButton />
            <DevNotice />

            <HeadingTertiary className={classes(Margins.top20, Margins.bottom8)}>Search Filters</HeadingTertiary>

            {!filtersReady ? (
                <LoadingIndicator type={LoadingIndicator.Type.SPINNING_CIRCLE} className={Margins.top8} />
            ) : (
                <>
                    <ErrorBoundary noop>
                        <SearchBar
                            autoFocus={true}
                            query={filters.value}
                            placeholder="Search for a plugin..."
                            onChange={query => updateFilters(prev => ({ ...prev, value: query }))}
                            onClear={() => updateFilters(prev => ({ ...prev, value: "" }))}
                        />
                        <div className={cl("filter-controls")}>
                            <Select
                                options={[
                                    { label: "Show All", value: SearchStatus.ALL },
                                    { label: "Show Enabled", value: SearchStatus.ENABLED },
                                    { label: "Show Disabled", value: SearchStatus.DISABLED },
                                    { label: "Show New", value: SearchStatus.NEW },
                                    hasUserPlugins && { label: "Show UserPlugins", value: SearchStatus.USER_PLUGINS },
                                    { label: "Show API Plugins", value: SearchStatus.API_PLUGINS }
                                ].filter(isTruthy)}
                                onSelectionChange={status => updateFilters(prev => ({ ...prev, status }))}
                                value={filters.status}

                                formatOption={option => ({
                                    ...option,
                                    id: option.value
                                })}
                                placeholder="Filter by Type"
                            />
                            <Select
                                options={[
                                    { label: "Alphabetical", value: SortMode.ALPHABETICAL },
                                    { label: "Enabled First", value: SortMode.ENABLED },
                                    { label: "Disabled First", value: SortMode.DISABLED },
                                    { label: "Has Settings", value: SortMode.HAS_SETTINGS }
                                ]}
                                onSelectionChange={sortBy => updateFilters(prev => ({ ...prev, sortBy }))}
                                value={filters.sortBy}
                                formatOption={option => ({
                                    ...option,
                                    id: option.value
                                })}
                            />
                            <SearchableSelect
                                options={PluginTags.map(tag => ({ label: tag, value: tag, id: tag }))}
                                value={Array.from(filters.tags)}
                                onSelectionChange={tags => updateFilters(prev => ({ ...prev, tags }))}
                                closeOnSelect={false}
                                selectionMode="multiple"
                                placeholder="Filter by Tags"
                            />
                        </div>
                    </ErrorBoundary>

                    <SectionHeader
                        tag="h2"
                        title={`Velocity Plugins (${plugins.length})`}
                        description="Enhance Discord with powerful plugins!"
                        gap={{ bottom: 8, top: 20 }}
                    />
                    {plugins.length
                        ? (
                            <>
                                <div className={cl("grid")}>
                                    {plugins.slice(0, visibleCount)}
                                </div>
                                {visibleCount < plugins.length && (
                                    <div ref={loaderRef} style={{ height: "10px", margin: "10px 0" }} />
                                )}
                            </>
                        )
                        : requiredPlugins.length ? null : <ExcludedPluginsList search={search} />
                    }
                </>
            )}

            <Forms.FormDivider gap={20} />
            <SectionHeader
                title="Required Plugins"
                description="These are required plugins for Velocity to function."
                gap={{ bottom: 8 }}
            />
            <div className={cl("grid")}>
                {requiredPlugins.length
                    ? requiredPlugins
                    : <Text variant="eyebrow">No plugins meet the search criteria</Text>
                }
            </div>
        </SettingsTab>
    );
}
