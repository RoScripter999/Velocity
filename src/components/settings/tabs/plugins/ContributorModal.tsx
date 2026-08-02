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

import "./ContributorModal.css";

import { useSettings } from "@api/Settings";
import { Paragraph } from "@components/Paragraph";
import { DevsById } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { fetchUserProfile, openUserProfile } from "@utils/discord";
import { pluralise } from "@utils/misc";
import type { ModalPropsRender, User } from "@velocity-types";
import { Icons, Modal, openModal, showToast, Text, useEffect, useMemo, UserProfileStore, useStateFromStores } from "@webpack/common";

import Plugins from "~plugins";

import { SectionHeader } from "../SectionHeader";
import { PluginCard } from "./PluginCard";

const cl = classNameFactory("vc-author-modal-");

export function openContributorModal(user: User) {
    openModal(modalProps => <ContributorModal user={user} modalProps={modalProps} />);
}

function ContributorModal({ user, modalProps }: { user: User; modalProps: ModalPropsRender; }) {
    useSettings();

    const profile = useStateFromStores([UserProfileStore], () => UserProfileStore.getUserProfile(user.id));

    useEffect(() => {
        if (!profile && !user.bot && user.id)
            fetchUserProfile(user.id);
    }, [user.id, user.bot, profile]);

    const { plugins, apiPlugins, corePlugins, totalPlugins, totalSettings } = useMemo(() => {
        const allPlugins = Object.values(Plugins);
        const devId = DevsById[user.id];

        const pluginsByAuthor = devId
            ? allPlugins.filter(p => p.authors.includes(devId))
            : allPlugins.filter(p => p.authors.some(a => a.name === user.username));

        const apiPlugins = pluginsByAuthor.filter(p => p.name.endsWith("API"));
        const corePlugins = pluginsByAuthor.filter(p => !p.name.endsWith("API") && p.required);
        const plugins = pluginsByAuthor.filter(p => !p.name.endsWith("API") && !p.required);

        return {
            plugins,
            apiPlugins,
            corePlugins,
            totalPlugins: pluginsByAuthor.length,
            totalSettings: plugins.reduce((acc, p) => acc + (p.settings ? Object.keys(p.settings.def).length : 0), 0)
        };
    }, [user.id, user.username]);

    return (
        <Modal
            {...modalProps}
            title={
                <div className={cl("header")}>
                    <img
                        className={cl("avatar", "avatar-wrap")}
                        src={user.getAvatarURL(void 0, 512, true)}
                        onClick={() => openUserProfile(user.id)}
                        draggable={false}
                        alt=""
                    />

                    <div className={cl("info")}>
                        <Text variant="text-md/bold">{user.username}</Text>

                        <div className={cl("stats")}>
                            <SectionHeader
                                title={pluralise(totalPlugins, "Plugin")}
                                titleColor="text-muted"
                                titleVariant="text-sm/normal"
                                tooltip={`${pluralise(totalPlugins, "Plugin")} authored`}
                                icon={() => <Icons.ListViewIcon size="xs" color="var(--text-muted)" />}
                            />
                            {totalSettings > 0 && (
                                <SectionHeader
                                    title={pluralise(totalSettings, "Setting")}
                                    titleColor="text-muted"
                                    titleVariant="text-sm/normal"
                                    tooltip="Total configurable settings across their plugins"
                                    icon={() => <Icons.SettingsIcon size="xs" color="var(--text-muted)" />}
                                />
                            )}
                        </div>
                    </div>
                </div>
            }
            subtitle={
                totalPlugins > 0
                    ? <Paragraph>This person has contributed to {pluralise(totalPlugins, "plugin")}!</Paragraph>
                    : <Paragraph color="text-muted">This contributor hasn't authored any plugins.</Paragraph>
            }
        >
            <div className={cl("plugins")}>
                {corePlugins.length > 0 && (
                    <div className={cl("plugin-section")}>
                        <SectionHeader
                            title="Core"
                            titleColor="text-muted"
                            titleVariant="text-sm/normal"
                            icon={() => <Icons.ShieldIcon size="xs" color="var(--text-muted)" />}
                        />
                        {corePlugins.map(p =>
                            <PluginCard key={p.name} plugin={p} disabled={true} onRestartNeeded={() => showToast("Restart to apply changes!")} />
                        )}
                    </div>
                )}
                {apiPlugins.length > 0 && (
                    <div className={cl("plugin-section")}>
                        <SectionHeader
                            title="Api"
                            titleColor="text-muted"
                            titleVariant="text-sm/normal"
                            icon={() => <Icons.WrenchIcon size="xs" color="var(--text-muted)" />}
                        />
                        {apiPlugins.map(p =>
                            <PluginCard key={p.name} plugin={p} disabled={true} onRestartNeeded={() => showToast("Restart to apply changes!")} />
                        )}
                    </div>
                )}
                {plugins.length > 0 && (
                    <div className={cl("plugin-section")}>
                        <SectionHeader
                            title="Plugins"
                            titleColor="text-muted"
                            titleVariant="text-sm/normal"
                            icon={() => <Icons.ListViewIcon size="xs" color="var(--text-muted)" />}
                        />
                        {plugins.map(p =>
                            <PluginCard key={p.name} plugin={p} disabled={false} onRestartNeeded={() => showToast("Restart to apply changes!")} />
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
