/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 Velocitcs and contributors
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

import "./PluginModal.css";

import { generateId } from "@api/Commands";
import { hasAnyVisibleSettings, isSettingHidden } from "@api/PluginManager";
import { useSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { GithubIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings";
import { Span } from "@components/Span";
import { debounce } from "@shared/debounce";
import { gitRemote } from "@shared/userAgent";
import { classNameFactory } from "@utils/css";
import { openUserProfile } from "@utils/discord";
import { proxyLazy } from "@utils/lazy";
import { classes } from "@utils/misc";
import { ModalContent, ModalFooter, ModalHeader, type ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { useForceUpdater } from "@utils/react";
import { humanFriendlyJoin } from "@utils/text";
import { OptionType, type Plugin, type PluginTag } from "@utils/types";
import type { User } from "@velocity-types";
import { Alerts, Avatar, Buttons, Clickable, FlexClasses, FluxDispatcher, Forms, Icons, LoadingIndicator, RichTooltip, Text, Tooltip, useEffect, useMemo, UserStore, UserUtils, useState } from "@webpack/common";
import type { Constructor } from "type-fest";

import { PluginMeta } from "~plugins";

import { OptionComponentMap } from "./components";
import { openContributorModal } from "./ContributorModal";

const cl = classNameFactory("vc-plugin-modal-");

const UserRecord: Constructor<Partial<User>> = proxyLazy(() => UserStore.getCurrentUser().constructor) as any;

interface PluginModalProps extends ModalProps {
    plugin: Plugin;
    onRestartNeeded(key: string): void;
}

function makeDummyUser(user: { username: string; id?: string; avatar?: string; }) {
    const newUser = new UserRecord({
        username: user.username,
        id: user.id ?? generateId(),
        avatar: user.avatar,
        /** To stop discord making unwanted requests... */
        bot: true
    });

    FluxDispatcher.dispatch({
        type: "USER_UPDATE",
        user: newUser
    });

    return newUser;
}


function PluginTags({ tags, searchTerms }: { tags: PluginTag[], searchTerms: string[] | undefined; }) {
    const hasSearchTerms = !searchTerms?.length;

    return (
        <>
            <SectionHeader title="Tags" className={hasSearchTerms ? Margins.top8 : undefined} />
            <div className={cl("tags")}>
                {tags.map(tag => (
                    <div key={tag} className={cl("tag")}>{tag}</div>
                ))}
            </div>
        </>
    );
}

export default function PluginModal({ plugin, onRestartNeeded, transitionState }: PluginModalProps) {
    const pluginSettings = useSettings([`plugins.${plugin.name}.*`]).plugins[plugin.name];
    const hasSettings = hasAnyVisibleSettings(plugin);

    // avoid layout shift by showing dummy users while loading users
    const fallbackAuthors = useMemo(() => [makeDummyUser({ username: "", id: "-1465912127305809920" })], []);
    const [authors, setAuthors] = useState<Partial<User>[]>([]);

    const [resetKey, forceUpdate] = useForceUpdater(true);

    useEffect(() => {
        (async () => {
            for (const user of plugin.authors.slice(0, 6)) {
                try {
                    const author = user.id
                        ? await UserUtils.getUser(String(user.id))
                            .catch(() => makeDummyUser({ username: user.name }))
                        : makeDummyUser({ username: user.name });

                    setAuthors(a => [...a, author]);
                } catch (e) {
                    continue;
                }
            }
        })();
    }, [plugin.authors]);

    const hasChangedSettings = useMemo(() => {
        if (!plugin.settings) return false;

        for (const [key, option] of Object.entries(plugin.settings.def)) {
            if (option.type === OptionType.CUSTOM) continue;

            const current = pluginSettings[key];

            let defaultValue: any;

            // 1. Primary default (correct source of truth)
            if ("default" in option) {
                defaultValue = option.default;
            }

            // 2. SELECT fallback ONLY if no default is defined at top-level
            if (
                defaultValue === undefined &&
                option.type === OptionType.SELECT &&
                !("default" in option)
            ) {
                const opts = typeof option.options === "function"
                    ? []
                    : option.options;

                const fallback = opts.find(o => o.default === true);
                defaultValue = fallback?.value;
            }

            // 3. No default defined → treat undefined consistently
            if (defaultValue === undefined) {
                if (current !== undefined) return true;
                continue;
            }

            if (current !== defaultValue) return true;
        }

        return false;
    }, [plugin.settings, pluginSettings, resetKey]);

    function resetPluginSettings() {
        Alerts.show({
            title: "Reset Plugin Settings",
            body: <>
                Are you sure you want to reset all settings for <strong>{plugin.name}</strong>?
                <div className={Margins.top8} style={{ display: "flex", gap: 4 }}>
                    <Icons.WarningIcon color="var(--text-feedback-critical)" size="sm" />
                    <Text color="text-feedback-critical">This action cannot be undone.</Text>
                </div>
            </>,
            confirmText: "Reset",
            cancelText: "Cancel",
            confirmVariant: "critical-primary",
            onConfirm() {
                for (const [key, option] of Object.entries(plugin.settings!.def)) {
                    if (option.type === OptionType.CUSTOM) continue;

                    const defaultValue = "default" in option && option.default !== undefined ? option.default : undefined;

                    if (defaultValue !== undefined) {
                        pluginSettings[key] = defaultValue;
                    } else {
                        delete pluginSettings[key];
                    }

                    if ("restartNeeded" in option && option.restartNeeded) onRestartNeeded(key);
                }
                forceUpdate();
            }
        });
    }

    function renderSettings() {
        const { settings } = plugin;
        if (!hasSettings || !settings)
            return (
                <div className={cl("no-settings")}>
                    <Text variant="text-sm/semibold" color="currentColor">This plugin doesn't have any settings yet. If any are added in the future, they'll show up here.</Text>
                </div>
            );

        const options = Object.entries(settings.def).map(([key, setting]) => {
            if (setting.type === OptionType.CUSTOM || isSettingHidden(settings, setting)) return null;

            function onChange(newValue: any) {
                const option = plugin.settings!.def[key];
                if (!option || option.type === OptionType.CUSTOM) return;

                pluginSettings[key] = newValue;

                if ("restartNeeded" in option && option.restartNeeded) onRestartNeeded(key);
            }

            const Component = OptionComponentMap[setting.type];
            return (
                <ErrorBoundary noop key={key}>
                    <Component
                        id={key}
                        setting={setting}
                        onChange={debounce(onChange)}
                        pluginSettings={pluginSettings}
                        definedSettings={settings}
                    />
                </ErrorBoundary>
            );
        });

        return (
            <div key={resetKey} className="vc-plugins-settings">
                {options}
            </div>
        );
    }

    function renderKeywords() {
        if (!plugin.searchTerms?.length) return null;

        return (
            <div className={classes(cl("keywords"), Margins.bottom8)}>
                <SectionHeader title="Plugin Keywords" tooltip="Search plugins associated with these keywords" />
                <Text variant="text-sm/normal" color="text-muted" lineClamp={1} selectable>
                    {humanFriendlyJoin(plugin.searchTerms)}
                </Text>
            </div>
        );
    }

    const pluginMeta = PluginMeta[plugin.name];

    return (
        <ModalRoot transitionState={transitionState} size={ModalSize.MEDIUM}>
            <ModalHeader separator={false} >
                <Text variant="text-lg/semibold">{plugin.name}</Text>
            </ModalHeader>

            <ModalContent className={"vc-settings-modal-content"}>
                <section>
                    <div className={cl("info")}>
                        <div>
                            <Span color="text-subtle">{plugin.description}</Span>
                            {renderKeywords()}
                            {!!plugin.tags?.length && <PluginTags tags={plugin.tags} searchTerms={plugin.searchTerms} />}
                        </div>
                    </div>

                    <Forms.FormDivider gap={8} />

                    <SectionHeader title="Plugin Authors" titleVariant="text-md/semibold" tooltipIcon={false} tooltip="The authors of the plugin that contributed in its development" icon={() => <Icons.GroupIcon color="var(--interactive-icon-active)" size="sm" />} className={Margins.bottom8} />
                    <div className={cl("authors")}>
                        <ErrorBoundary noop>
                            {authors.length === 0 ? (
                                <LoadingIndicator type="pulsingEllipsis" />
                            ) : (
                                <div className={cl("author-list")}>
                                    {(authors.length ? authors : fallbackAuthors).slice(0, 6).map((user: Partial<User>, i) => (
                                        <Tooltip key={i} text={`View ${user.username}'s profile`}>
                                            {({ onMouseEnter, onMouseLeave }) => (
                                                <Clickable
                                                    className={cl("author-pill")}
                                                    onClick={() => openContributorModal(user as User)}
                                                    onContextMenu={() => user.id && openUserProfile(user.id)}
                                                    onMouseEnter={onMouseEnter}
                                                    onMouseLeave={onMouseLeave}
                                                >
                                                    <Avatar
                                                        src={user.getAvatarURL?.(void 0, 80, true)}
                                                        size="SIZE_24"
                                                    />
                                                    <Span>{user.username}</Span>
                                                </Clickable>
                                            )}
                                        </Tooltip>
                                    ))}
                                    {plugin.authors.length > 6 && (
                                        <Tooltip text={plugin.authors.slice(6).map(u => u.name).join(", ")}>
                                            {({ onMouseEnter, onMouseLeave }) => (
                                                <div
                                                    className={cl("author-pill") + " " + cl("author-overflow")}
                                                    onMouseEnter={onMouseEnter}
                                                    onMouseLeave={onMouseLeave}
                                                >
                                                    +{plugin.authors.length - 6} more
                                                </div>
                                            )}
                                        </Tooltip>
                                    )}
                                </div>
                            )}
                        </ErrorBoundary>
                    </div>
                </section>

                {!!plugin.settingsAboutComponent && (
                    <div className={Margins.top16}>
                        <Forms.FormSection>
                            <ErrorBoundary message="An error occurred while rendering this plugin's custom Info Component">
                                <plugin.settingsAboutComponent />
                            </ErrorBoundary>
                        </Forms.FormSection>
                    </div>
                )}

                <section>
                    <SectionHeader title="Settings" titleVariant="text-md/semibold" icon={() => <Icons.SettingsIcon color="var(--interactive-icon-active)" size="sm" />} className={classes(Margins.bottom16, Margins.top16)} />
                    {renderSettings()}
                </section>
            </ModalContent>
            <ModalFooter direction={FlexClasses.Direction.HORIZONTAL}>
                {plugin.settings && hasChangedSettings && (
                    <RichTooltip body="Reset Plugin Settings">
                        <Buttons.Button variant="critical-secondary" icon={Icons.TrashIcon} text="Reset Settings" size="sm" onClick={resetPluginSettings} style={{ flex: 1 }} />
                    </RichTooltip>
                )}
                {!pluginMeta.userPlugin && (
                    <div className="vc-settings-modal-links">
                        <Buttons.Button variant="secondary" size="sm" icon={GithubIcon} text="Source Code" onClick={() => VelocityNative.native.openExternal(`https://github.com/${gitRemote}/tree/main/src/plugins/${pluginMeta.folderName}`)} />
                    </div>
                )}
            </ModalFooter>
        </ModalRoot >
    );
}

export function openPluginModal(plugin: Plugin, onRestartNeeded?: (pluginName: string, key: string) => void) {
    openModal(modalProps => (
        <PluginModal
            {...modalProps}
            plugin={plugin}
            onRestartNeeded={(key: string) => onRestartNeeded?.(plugin.name, key)}
        />
    ));
}
