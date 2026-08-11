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
import { useForceUpdater } from "@utils/react";
import { humanFriendlyJoin } from "@utils/text";
import { OptionType, type Plugin } from "@utils/types";
import type { ModalPropsRender, User } from "@velocity-types";
import { Avatar, Clickable, ConfirmModal, FluxDispatcher, Forms, Icons, LoadingIndicator, Modal, openModal, TagGroup, Text, Tooltip, useEffect, useMemo, UserStore, UserUtils, useState } from "@webpack/common";
import type { Constructor, SetRequired } from "type-fest";

import { PluginMeta } from "~plugins";

import { OptionComponentMap } from "./components";
import { openContributorModal } from "./ContributorModal";

const cl = classNameFactory("vc-plugin-modal-");

const UserRecord: Constructor<Partial<User>> = proxyLazy(() => UserStore.getCurrentUser().constructor) as any;

interface PluginModalProps extends ModalPropsRender {
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


function PluginTags({ plugin }: { plugin: SetRequired<Plugin, "tags">; }) {
    return (
        <div className={!plugin.searchTerms?.length ? Margins.top8 : undefined}>
            <Text className={Margins.bottom8}>Tags</Text>
            <TagGroup label="Tags" items={plugin.tags.map((tag, index) => ({ id: index, label: tag }))} />
        </div>
    );
}

function PluginKeywords({ plugin }: { plugin: SetRequired<Plugin, "searchTerms">; }) {
    return (
        <div className={classes(Margins.top8, Margins.bottom8)}>
            <Text className={Margins.bottom8}>Keywords</Text>
            <Text variant="text-sm/normal" color="text-muted" lineClamp={1} selectable>
                {humanFriendlyJoin(plugin.searchTerms)}
            </Text>
        </div>
    );
}

export default function PluginModal({ plugin, onRestartNeeded, ...modalProps }: PluginModalProps) {
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
            const current = pluginSettings[key];

            if (option.type === OptionType.CUSTOM) {
                const defaultValue = "default" in option ? option.default : undefined;
                if (defaultValue === undefined) {
                    if (current !== undefined) return true;
                } else if (JSON.stringify(current) !== JSON.stringify(defaultValue)) {
                    return true;
                }
                continue;
            }

            let defaultValue: any;

            if ("default" in option) {
                defaultValue = option.default;
            }

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

            if (defaultValue === undefined) {
                if (current !== undefined) return true;
                continue;
            }

            // Deep comparison for objects/arrays to prevent reference mismatch
            if (typeof defaultValue === "object" && defaultValue !== null) {
                if (JSON.stringify(current) !== JSON.stringify(defaultValue)) return true;
            } else if (current !== defaultValue) {
                return true;
            }
        }

        return false;
    }, [plugin.settings, pluginSettings, resetKey]);

    function resetPluginSettings() {
        void openModal(props => (
            <ConfirmModal
                {...props}
                title="Reset Plugin Settings"
                confirmText="Reset"
                notice={{
                    message: "This action cannot be undone.",
                    type: "critical"
                }}
                cancelText="Cancel"
                onConfirm={() => {
                    for (const [key, option] of Object.entries(plugin.settings!.def)) {
                        const defaultValue = "default" in option ? option.default : undefined;
                        const currentValue = pluginSettings[key];

                        option.onReset?.(currentValue);

                        pluginSettings[key] = undefined;
                        delete pluginSettings[key];

                        if (option.type === OptionType.CUSTOM && "onChange" in option) {
                            option.onChange?.(defaultValue);
                        }

                        if ("restartNeeded" in option && option.restartNeeded && currentValue !== defaultValue) {
                            onRestartNeeded(key);
                        }
                    }
                    forceUpdate();
                }}
            >
                Are you sure you want to reset all settings for <strong>{plugin.name}</strong>?
            </ConfirmModal>
        ));
    }

    function renderSettings() {
        const { settings } = plugin;
        if (!hasSettings || !settings)
            return (
                <Text variant="text-sm/semibold" color="currentColor">This plugin doesn't have any settings yet. If any are added in the future, they'll show up here.</Text>
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
                        closePluginSettings={modalProps.onClose}
                    />
                </ErrorBoundary>
            );
        });

        return (
            <div key={resetKey} className={cl("settings")}>
                {options}
            </div>
        );
    }

    const pluginMeta = PluginMeta[plugin.name];

    return (
        <Modal
            {...modalProps}
            size="lg"
            title={plugin.name}
            subtitle={
                <div>
                    <Span color="text-subtle">{plugin.description}</Span>
                    {!!plugin.searchTerms?.length && <PluginKeywords plugin={{ ...plugin, searchTerms: plugin.searchTerms }} />}
                    {!!plugin.tags?.length && <PluginTags plugin={{ ...plugin, tags: plugin.tags }} />}
                </div>
            }
            actions={[
                ...(plugin.settings && hasChangedSettings ? [{
                    text: "Reset Settings",
                    variant: "critical-secondary" as any,
                    icon: Icons.TrashIcon,
                    onClick: resetPluginSettings
                }] : []),
                ...(!pluginMeta.userPlugin ? [{
                    text: "Source Code",
                    variant: "secondary" as any,
                    icon: GithubIcon,
                    onClick: () => VelocityNative.native.openExternal(`https://github.com${gitRemote}/tree/main/src/plugins/${pluginMeta.folderName}`)
                }] : [])
            ]}
        >
            <div>
                <section>
                    <SectionHeader title="Plugin Authors" titleVariant="text-md/semibold" tooltip="The authors of the plugin that contributed in its development" icon={() => <Icons.GroupIcon color="var(--interactive-icon-active)" size="sm" />} gap={{ bottom: 8 }} />
                    <div className={cl("authors")}>
                        <ErrorBoundary noop>
                            {authors.length === 0 ? (
                                <LoadingIndicator type="pulsingEllipsis" />
                            ) : (
                                <div className={cl("author-list")}>
                                    {(authors.length ? authors : fallbackAuthors).slice(0, 6).map((user, i) => (
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
            </div>
        </Modal>
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
