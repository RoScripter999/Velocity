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

import { Settings } from "@api/Settings";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Paginator } from "@components/Paginator";
import { SectionHeader } from "@components/settings/tabs";
import { SettingsTab } from "@components/settings/tabs/SectionSettings";
import type { Dev } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getIntlMessage, openImageModal } from "@utils/discord";
import { classes } from "@utils/misc";
import { useForceUpdater } from "@utils/react";
import { Buttons, LoadingIndicator, openModal, SearchableSelect, SearchBar, Text, Tooltip, useEffect, useState } from "@webpack/common";

import { ThemeModal } from "./download";

const cl = classNameFactory("vc-themes-lib-");

export interface Theme {
    banner: string;
    icon: string;
    name: string;
    description: string;
    tags?: string[];
    invite?: string;
    author: Dev;
    themeCode: string;
}

interface ThemeResult {
    themes: Theme[];
    tags: string[];
}

interface ThemeCardProps {
    theme: Theme;
    selectedTags: string[];
    onTagSelect: (tag: string) => void;
    ownedThemes: string[];
    onOwnershipChange: (themeName: string, owned: boolean) => void;
}

let ThemesJSON = {} as ThemeResult;

let themesLoaded = false;

async function loadThemes(onFail?: () => void) {
    if (themesLoaded) return;
    try {
        // In dev mode if you want to add and test themes, change this line to VelocityNative.themes.getThemeData("themeLibThemes.json") as unknown as ThemeResult;
        ThemesJSON = await VelocityNative.themes.getOnlineThemes();

        if (typeof ThemesJSON === "string") ThemesJSON = JSON.parse(ThemesJSON);

        // This is required so you don't ratelimit github
        themesLoaded = true;
    } catch {
        onFail?.();
    }
}

function LoadFailed() {
    return (
        <div className={cl("banner-img-failed")}>
            <img
                role="img"
                aria-hidden={true}
                draggable={false}
                src="https://cdn.discordapp.com/assets/content/01fad351459d7599c15e3503bc14fadd01f8d18ffb2c66e064370504bd59ee82.svg"
            />
            <Text variant="text-sm/medium" color="text-subtle">{getIntlMessage("IMAGE_ERROR")}</Text>
        </div>
    );
}


export function BannerTryCatch({ theme, className }: { theme: Theme; className: string; }) {
    const [hasError, setHasError] = useState(false);

    return hasError ? <LoadFailed /> :
        <img
            src={theme.banner}
            className={className}
            draggable={false}
            onError={() => {
                setHasError(true);
            }}
            onClick={() => openImageModal({
                url: theme.banner,
                height: 1680,
                width: 1680
            })}
        />;
}


function ThemeCard({ theme, selectedTags, onTagSelect, ownedThemes, onOwnershipChange }: ThemeCardProps) {
    const [loading, setLoading] = useState(false);

    const isOwned = ownedThemes.includes(theme.name);

    const handleThemeAdded = () => {
        onOwnershipChange(theme.name, true);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await VelocityNative.themes.deleteTheme(theme.name.endsWith(".css") ? theme.name : `${theme.name}.css`);
            Settings.themes.localThemes = JSON.parse(JSON.stringify(Settings.themes.localThemes)).filter(t => t.name !== (theme.name.endsWith(".css") ? theme.name : `${theme.name}.css`));
            onOwnershipChange(theme.name, false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="none" className={cl("card")}>
            <Flex flexDirection="column" className={cl("header")}>
                <BannerTryCatch className={cl("banner")} theme={theme} />
                <div className={cl("icon-wrapper")}>
                    <Tooltip hideOnClick={false} text={theme.author.name}>
                        {tooltipProps => (
                            <img className={cl("icon")} src={theme.icon} {...tooltipProps} />
                        )}
                    </Tooltip>
                </div>
            </Flex>
            <div className={cl("content")}>
                <SectionHeader tag="h6" titleVariant="text-md/semibold" title={theme.name} description={theme.description} />
                {theme?.tags && theme.tags.length > 0 && (
                    <Flex gap="8px" flexWrap="wrap">
                        {theme.tags.map(tag => (
                            <div key={tag} className={classes(cl("tag"), selectedTags.includes(tag) && cl("tag-active"))}>
                                <button
                                    onClick={() => onTagSelect(tag)}
                                    style={{ background: "none", color: "currentColor" }}
                                >
                                    {tag}
                                </button>
                            </div>
                        ))}
                    </Flex>
                )}
                <Buttons.Button
                    text={isOwned ? "Delete" : "Download"}
                    variant={isOwned ? "critical-primary" : "primary"}
                    size="sm"
                    fullWidth={true}
                    loading={loading}
                    onClick={async () => {
                        if (isOwned) {
                            await handleDelete();
                        } else {
                            openModal(props => <ThemeModal {...props} theme={theme} onThemeAdded={handleThemeAdded} />);
                        }
                    }}
                />
            </div>
        </Card>
    );
}

export function ThemesLibTab() {
    const forceUpdate = useForceUpdater();
    const [currentPage, setCurrentPage] = useState(1);
    const [ownedThemes, setOwnedThemes] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        tags: [] as string[],
        search: ""
    });

    const [loadFailed, setLoadFailed] = useState(false);

    const retryLoad = () => {
        themesLoaded = false;
        ThemesJSON = {} as ThemeResult;
        setLoadFailed(false);
        loadThemes(() => setLoadFailed(true)).then(() => forceUpdate());
    };

    useEffect(() => {
        loadThemes(() => setLoadFailed(true)).then(() => forceUpdate());
        VelocityNative.themes.getThemesList().then(themes => {
            setOwnedThemes(themes.map(v => v.name.replace(/\.css$/, "")));
        });
    }, []);

    const handleOwnershipChange = (themeName: string, owned: boolean) => {
        setOwnedThemes(prev => owned
            ? [...prev, themeName]
            : prev.filter(name => name !== themeName)
        );
    };

    const itemsPerPage = 10;
    const themesList = ThemesJSON.themes ? Object.values(ThemesJSON.themes) : [];

    const filteredThemes = filters.tags.length > 0 || filters.search
        ? themesList.filter(theme => {
            const matchesSearch = theme.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                theme.description.toLowerCase().includes(filters.search.toLowerCase());
            const matchesTags = filters.tags.length === 0 || (theme.tags && theme.tags.some(tag => filters.tags.includes(tag)));
            return matchesSearch && matchesTags;
        })
        : themesList;

    const totalThemes = filteredThemes.length;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedThemes = filteredThemes.slice(startIdx, startIdx + itemsPerPage);

    const handleTagSelect = (tag: string) => {
        setFilters(prev => {
            const updated = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];

            return { ...prev, tags: updated };
        });
        setCurrentPage(1);
    };

    return (
        <SettingsTab>
            <div className={cl("heading")}>
                <Text variant="heading-md/bold" tag="h2">Search Filters</Text>
                <div className={cl("filters")}>
                    <SearchBar
                        query={filters.search}
                        onChange={query => setFilters(prev => ({ ...prev, search: query }))}
                        onClear={() => setFilters(prev => ({ ...prev, search: "" }))}
                        placeholder="Search themes..."
                    />
                    <div style={{ flex: 2 }}>
                        <SearchableSelect
                            options={ThemesJSON.tags?.map(tag => ({ label: tag, value: tag, id: tag })) ?? []}
                            value={filters.tags}
                            onSelectionChange={(tags: string[]) => {
                                setFilters(prev => ({ ...prev, tags: tags ?? [] }));
                                setCurrentPage(1);
                            }}
                            closeOnSelect={false}
                            placeholder="Filter by Tags"
                            selectionMode="multiple"
                        />
                    </div>
                </div>
            </div>
            <SectionHeader
                tag="h2"
                title={`Total Themes: ${totalThemes}`}
                description="Customize your discord with amazing themes"
                margin="bottom16"
            />
            <Flex flexWrap="wrap" justifyContent="center" gap="20px">
                {paginatedThemes.length > 0
                    ? paginatedThemes.map(theme => (
                        <ThemeCard
                            key={theme.name}
                            theme={theme}
                            selectedTags={filters.tags}
                            onTagSelect={handleTagSelect}
                            ownedThemes={ownedThemes}
                            onOwnershipChange={handleOwnershipChange}
                        />
                    ))
                    : !themesLoaded && !loadFailed
                        ? <LoadingIndicator type="spinningCircle" />
                        : <>
                            <div className={cl("no-themes")} />
                            <Flex justifyContent="center" alignItems="center" flexDirection="column" style={{ width: "100%", margin: "auto" }}>
                                <Text variant="display-sm" color={loadFailed ? "text-feedback-critical" : "text-muted"}>{loadFailed ? "Failed to load themes" : "No themes found"}</Text>
                                {loadFailed && <Buttons.Button text="Retry" variant="primary" size="sm" onClick={retryLoad} />}
                            </Flex>
                        </>
                }
            </Flex>
            <Paginator
                currentPage={currentPage}
                maxVisiblePages={totalThemes}
                pageSize={itemsPerPage}
                totalCount={totalThemes}
                onPageChange={setCurrentPage}
            />
        </SettingsTab>
    );
}
