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

import { isPluginEnabled } from "@api/PluginManager";
import { ThemeDef, useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { FormSwitch } from "@components/FormSwitch";
import { Link } from "@components/Link";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { AddonCard, openPluginModal, QuickAction, QuickActionCard, SectionHeader, SettingsTab } from "@components/settings";
import type { UserThemeHeader } from "@main/themes";
import ClientThemePlugin from "@plugins/clientTheme";
import { classNameFactory } from "@utils/css";
import { getStylusWebStoreUrl } from "@utils/web";
import { Buttons, Dialog, Field, Forms, Icons, Popout, PopoutClasses, SearchBar, Select, Text, TextInput, useCallback, useEffect, useRef, useState } from "@webpack/common";

import { CspErrorCard } from "./CspErrorCard";
import { VelocityThemesTab } from "./VelocityThemesTab";

const cl = classNameFactory("vc-settings-themes-");

const enum SearchStatus {
    ALL,
    ENABLED,
    DISABLED,
    LOCAL,
    ONLINE
}

function normalizeThemeDef(t: ThemeDef): ThemeDef {
    return {
        name: String(t.name),
        themeActivationModes: t.themeActivationModes ?? "always",
        enabled: t.enabled !== false
    };
}

function ThemeCardActions({ fileName, onDelete }: { fileName: string; onDelete(): void; }) {
    const buttonRef = useRef(null);

    return (
        <Popout
            position="bottom"
            align="center"
            targetElementRef={buttonRef}
            nudgeAlignIntoViewport
            renderPopout={({ closePopout, setPopoutRef }) => (
                <ConfigureDialog ref={setPopoutRef} fileName={fileName} onDelete={() => { onDelete(); closePopout(); }} />
            )}
        >
            {popoutProps => (
                <button {...popoutProps} ref={buttonRef} className={cl("settings-icon")}>
                    <Icons.SettingsIcon color="currentColor" />
                </button>
            )}
        </Popout>
    );
}

function ConfigureDialog({ fileName, onDelete, ref }: { fileName: string; onDelete(): void; ref: React.Ref<null>; }) {
    const settings = useSettings(["themes.*"]);

    const isOnline = (settings.themes.onlineThemes ?? []).some(t => t.name === fileName);
    const current = isOnline
        ? settings.themes.onlineThemes.find(t => t.name === fileName)?.themeActivationModes ?? "always"
        : settings.themes.localThemes.find(t => t.name === fileName)?.themeActivationModes ?? "always";

    async function handleDelete() {
        const isOnline = (settings.themes.onlineThemes ?? []).some(t => t.name === fileName);

        if (isOnline) {
            settings.themes.onlineThemes = (settings.themes.onlineThemes ?? [])
                .filter(t => t.name !== fileName)
                .map(t => ({ name: String(t.name), themeActivationModes: t.themeActivationModes, enabled: t.enabled === true }));
        } else {
            await VelocityNative.themes.deleteTheme(fileName);
            settings.themes.localThemes = settings.themes.localThemes
                .filter(t => t.name !== fileName)
                .map(normalizeThemeDef);
        }

        onDelete();
    }

    return (
        <Dialog className={PopoutClasses.container} ref={ref} style={{ width: "400px", padding: 12 }}>
            <SectionHeader titleVariant="text-md/semibold" title={`Configure ${fileName}`} description="Modify this theme's settings" gap={{ bottom: 8 }} />

            <Select
                label="Activate theme on"
                value={current}
                options={[
                    { value: "always", label: "Always" },
                    { value: "light", label: "Light mode only" },
                    { value: "dark", label: "Dark mode only" }
                ]}
                clearable={current !== "always"}
                formatOption={option => ({ ...option, id: option.value })}
                onSelectionChange={value => {
                    const isOnline = (settings.themes.onlineThemes ?? []).some(t => t.name === fileName);
                    const key = isOnline ? "onlineThemes" : "localThemes";
                    const list = isOnline ? (settings.themes.onlineThemes ?? []) : settings.themes.localThemes;

                    settings.themes[key] = list.map(t => ({
                        ...t,
                        themeActivationModes: t.name === fileName ? value : t.themeActivationModes,
                        enabled: t.enabled !== false
                    }));
                }}
            />

            <Buttons.ButtonGroup className={Margins.top16} direction="horizontal">
                {!(settings.themes.onlineThemes ?? []).some(t => t.name === fileName) && (
                    <Buttons.Button
                        variant="secondary"
                        text="Open in Folder"
                        icon={Icons.FolderIcon}
                        onClick={() => VelocityNative.themes.openFolder(fileName)}
                    />
                )}
                <Buttons.Button
                    variant="critical-secondary"
                    text="Delete Theme"
                    icon={Icons.TrashIcon}
                    onClick={handleDelete}
                />
            </Buttons.ButtonGroup>
        </Dialog>
    );
}

function ThemesTab() {
    const settings = useSettings(["themes.*"]);

    const [userThemes, setUserThemes] = useState<UserThemeHeader[] | null>(null);
    const [onlineThemesText, setOnlineThemesText] = useState<string>("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<SearchStatus>(SearchStatus.ALL);

    const onlineThemes = settings.themes.onlineThemes ?? [];

    const refreshThemes = async () => {
        const themes = await VelocityNative.themes.getThemesList();
        setUserThemes(themes);
    };

    useEffect(() => {
        refreshThemes();
    }, []);

    const filterTheme = useCallback((name: string, isLocal: boolean) => {
        const enabled = isLocal
            ? settings.themes.localThemes.some(t => t.name === name && t.enabled !== false)
            : (settings.themes.onlineThemes ?? []).find(t => t.name === name)?.enabled !== false;

        switch (status) {
            case SearchStatus.ENABLED: if (!enabled) return false; break;
            case SearchStatus.DISABLED: if (enabled) return false; break;
            case SearchStatus.LOCAL: if (!isLocal) return false; break;
            case SearchStatus.ONLINE: if (isLocal) return false; break;
        }

        const query = search.trim().toLowerCase();
        if (!query.length) return true;

        return name.toLowerCase().includes(query);
    }, [status, search, settings.themes.localThemes, settings.themes.onlineThemes]);

    function validUrl(url: string) {
        const value = url.trim();

        // google ai lol
        const match = value.match(/^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9._~-]+)*\.css$/);
        if (!match || match[0] !== value) return false;

        return value;
    }

    function onThemeChange(fileName: string, value: boolean, isOnline: boolean) {
        if (isOnline) {
            settings.themes.onlineThemes = (settings.themes.onlineThemes ?? []).map(t => ({
                name: String(t.name),
                themeActivationModes: t.themeActivationModes ?? "always",
                enabled: t.name === fileName ? value : (t.enabled !== false)
            }));
        } else {
            const current = (settings.themes.localThemes ?? []).map(normalizeThemeDef);
            if (!current.some(t => t.name === fileName)) {
                settings.themes.localThemes = [...current, { name: String(fileName), themeActivationModes: "always", enabled: value }];
            } else {
                settings.themes.localThemes = current.map(t => ({
                    ...t,
                    enabled: t.name === fileName ? value : t.enabled
                }));
            }
        }
    }

    const filteredLocal = (userThemes ?? []).filter(t => filterTheme(t.fileName, true));
    const filteredOnline = onlineThemes.filter(t => filterTheme(t.name, false));

    return (
        <SettingsTab>
            <CspErrorCard />
            <SectionHeader
                tag="h5"
                title="Themes"
                description="Customize Discord's appearance with themes. Add local .css files or load themes directly from URLs. Click on the cog wheel icon to customize a theme's settings."
                descriptionColor="text-default"
                gap={{ bottom: 20 }}
            />
            <Field label="Quick Actions">
                <QuickActionCard>
                    <>
                        {!IS_WEB && (
                            <QuickAction
                                text="Open Themes Folder"
                                action={() => VelocityNative.themes.openFolder()}
                                Icon={Icons.FolderIcon}
                            />
                        )}
                        <QuickAction
                            text="Reload Themes"
                            action={refreshThemes}
                            Icon={Icons.RefreshIcon}
                        />
                        <QuickAction
                            text="Edit QuickCSS"
                            action={() => VelocityNative.quickCss.openEditor()}
                            Icon={Icons.PaintbrushThickIcon}
                        />
                        {isPluginEnabled(ClientThemePlugin.name) && (
                            <QuickAction
                                text="Edit ClientTheme"
                                action={() => openPluginModal(ClientThemePlugin)}
                                Icon={Icons.PencilIcon}
                            />
                        )}
                    </>
                </QuickActionCard>
            </Field>

            <section>
                <Forms.FormTitle>Online Themes</Forms.FormTitle>
                <Paragraph className={Margins.bottom16}>Load themes from URLs instead from your device. Online themes will automatically update when their source changes.</Paragraph>
                <FormSwitch
                    title="Enable Online Themes"
                    description="Toggle online themes. When disabled, all online themes will be turned off and you won't be able to add new ones."
                    value={settings.themes.onlineThemesEnabled}
                    onChange={val => settings.themes.onlineThemesEnabled = val}
                />

                <div className={cl("row")}>
                    <TextInput
                        placeholder="https://example.com/theme.css"
                        value={onlineThemesText}
                        disabled={!settings.themes.onlineThemesEnabled}
                        onChange={setOnlineThemesText}
                        error={onlineThemesText.trim() && !validUrl(onlineThemesText.trim()) ? "Invalid URL" : undefined}
                        successMessage={onlineThemesText.trim() && validUrl(onlineThemesText.trim()) ? "That looks correct" : undefined}
                    />
                    <Buttons.Button
                        text="Add"
                        disabled={!settings.themes.onlineThemesEnabled || !onlineThemesText.trim() || !validUrl(onlineThemesText.trim())}
                        onClick={() => {
                            settings.themes.onlineThemes = [
                                ...((settings.themes.onlineThemes ?? []).map(t => ({
                                    name: t.name,
                                    themeActivationModes: t.themeActivationModes ?? "always",
                                    enabled: t.enabled !== false
                                }))),
                                {
                                    name: onlineThemesText.trim(),
                                    themeActivationModes: "always",
                                    enabled: false
                                }
                            ];

                            setOnlineThemesText("");
                        }}
                    />
                </div>
            </section>

            <section>
                <Forms.FormTitle>Installed Themes</Forms.FormTitle>
                <Paragraph className={Margins.bottom16}>Manage, Configure, Delete your themes here. Local themes load from your themes folder, online themes from URLs.</Paragraph>

                <div className={cl("row")}>
                    <SearchBar
                        placeholder="Search themes..."
                        query={search}
                        onChange={setSearch}
                    />
                    <Select
                        options={[
                            { label: "All", value: SearchStatus.ALL },
                            { label: "Enabled", value: SearchStatus.ENABLED },
                            { label: "Disabled", value: SearchStatus.DISABLED },
                            { label: "Local", value: SearchStatus.LOCAL },
                            { label: "Online", value: SearchStatus.ONLINE }
                        ]}
                        value={status}
                        onSelectionChange={setStatus}
                        formatOption={option => ({ ...option, id: option.value })}
                    />
                </div>

                {userThemes === null ? (
                    <Paragraph>Loading themes...</Paragraph>
                ) : filteredLocal.length === 0 && filteredOnline.length === 0 ? (
                    <Text variant="eyebrow">No themes match your search.</Text>
                ) : (
                    <div className={cl("grid")}>
                        {[
                            ...filteredLocal.map(theme => ({
                                key: theme.fileName,
                                name: theme.name,
                                description: theme.description,
                                author: "By " + theme.author,
                                enabled: settings.themes.localThemes.some(t => t.name === theme.fileName && t.enabled !== false),
                                setEnabled: (enabled: boolean) => onThemeChange(theme.fileName, enabled, false),
                                infoButton: <ThemeCardActions fileName={theme.fileName} onDelete={refreshThemes} />,
                                footer: (
                                    <Icons.FolderIcon
                                        color="currentColor"
                                        size="xs"
                                        onClick={() => VelocityNative.themes.openFolder(theme.fileName)}
                                        style={{ cursor: "pointer" }}
                                    />
                                ),
                                disabled: false
                            })),
                            ...filteredOnline.map(theme => ({
                                key: theme.name,
                                name: theme.name,
                                description: "Online Theme",
                                author: "",
                                enabled: theme.enabled || false,
                                setEnabled: (enabled: boolean) => onThemeChange(theme.name, enabled, true),
                                infoButton: <ThemeCardActions fileName={theme.name} onDelete={() => { }} />,
                                footer: (
                                    <Icons.LinkExternalMediumIcon
                                        color="currentColor"
                                        size="xs"
                                        onClick={() => VelocityNative.native.openExternal(theme.name)}
                                        style={{ cursor: "pointer" }}
                                    />
                                ),
                                disabled: !settings.themes.onlineThemesEnabled
                            }))
                        ].map(({ key, ...props }) => (
                            <AddonCard key={key} {...props} />
                        ))}
                    </div>
                )}
            </section>

            <section className={Margins.top20}>
                <VelocityThemesTab />
            </section>
        </SettingsTab>
    );
}

function UserscriptThemesTab() {
    return (
        <SettingsTab>
            <Card className="vc-settings-card">
                <SectionHeader
                    tag="h5"
                    title="Themes are not supported on the Userscript!"
                    description={(
                        <>
                            You can instead install themes with the{" "}
                            <Link href={getStylusWebStoreUrl()}>Stylus extension</Link>!
                        </>
                    )}
                />
            </Card>
        </SettingsTab>
    );
}

export default IS_USERSCRIPT ? UserscriptThemesTab : ThemesTab;
