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

import { isPluginEnabled, pluginRequiresRestart, startDependenciesRecursive, startPlugin, stopPlugin } from "@api/PluginManager";
import { definePluginSettings, Settings, SettingsStore } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { showAlert } from "@components/AlertModal";
import { Card } from "@components/Card";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { PluginsIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { openPluginModal, openSettingsTabModal, UpdaterTab } from "@components/settings";
import { Span } from "@components/Span";
import SettingsPlugin from "@plugins/_core/settings";
import { CONTRIB_ROLE_ID, Devs, DONOR_ROLE_ID, KNOWN_ISSUES_CHANNEL_ID, REGULAR_ROLE_ID, SUPPORT_CATEGORY_ID, SUPPORT_CHANNEL_ID, VEBOT_USER_ID, VELOCITY_GUILD_ID } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import { Logger } from "@utils/Logger";
import { classes, isPluginDev, tryOrElse } from "@utils/misc";
import { relaunch } from "@utils/native";
import { onlyOnce } from "@utils/onlyOnce";
import { makeCodeblock } from "@utils/text";
import definePlugin, { type Plugin } from "@utils/types";
import { checkForUpdates, isOutdated, update } from "@utils/updater";
import type { Channel } from "@velocity-types";
import { Buttons, ChannelStore, Forms, GuildMemberStore, Icons, Parser, PermissionsBits, PermissionStore, RelationshipStore, showToast, Text, Toasts, useEffect, UserStore, useState } from "@webpack/common";
import type { JSX } from "react";

import gitHash from "~git-hash";
import plugins, { PluginMeta } from "~plugins";

const AdditionalAllowedChannelIds = [
    "1024286218801926184" // Velocity > #bot-spam
];

const TrustedRolesIds = [
    CONTRIB_ROLE_ID, // contributor
    REGULAR_ROLE_ID, // regular
    DONOR_ROLE_ID // donor
];

const ShowCurrentGame = getUserSettingLazy<boolean>("status", "showCurrentGame")!;

const isSupportAllowedChannel = (channel: Channel) => channel.parent_id === SUPPORT_CATEGORY_ID || AdditionalAllowedChannelIds.includes(channel.id);

async function forceUpdate() {
    const outdated = await checkForUpdates();
    if (outdated) {
        await update();
        relaunch();
    }

    return outdated;
}

async function generateDebugInfoMessage() {
    const { RELEASE_CHANNEL } = window.GLOBAL_ENV;

    const client = (() => {
        if (IS_DISCORD_DESKTOP) return `Discord Desktop v${DiscordNative.app.getVersion()}`;

        // @ts-expect-error
        const name = typeof unsafeWindow !== "undefined" ? "UserScript" : "Web";
        return `${name} (${navigator.userAgent})`;
    })();

    const info = {
        Velocity:
            `v${VERSION} • [${gitHash}](<https://github.com/Velocitcs/Velocity/commit/${gitHash}>)` +
            `${SettingsPlugin.additionalInfo} - ${Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(BUILD_TIMESTAMP)}`,
        Client: `${RELEASE_CHANNEL} ~ ${client}`,
        Platform: navigator.platform
    };

    if (IS_DISCORD_DESKTOP) {
        info["Last Crash Reason"] = (await tryOrElse(() => DiscordNative.processUtils.getLastCrash(), undefined))?.rendererCrashReason ?? "N/A";
    }

    const commonIssues = {
        "Activity Sharing disabled": tryOrElse(() => !ShowCurrentGame.getSetting(), false),
        "Velocity DevBuild": IS_DEV,
        "Has UserPlugins": Object.values(PluginMeta).some(m => m.userPlugin),
        "More than two weeks out of date": BUILD_TIMESTAMP < Date.now() - 12096e5
    };

    let content = `>>> ${Object.entries(info).map(([k, v]) => `**${k}**: ${v}`).join("\n")}`;
    content += "\n" + Object.entries(commonIssues)
        .filter(([, v]) => v).map(([k]) => `⚠️ ${k}`)
        .join("\n");

    return content.trim();
}

function generatePluginList() {
    const isApiPlugin = (plugin: string) => plugin.endsWith("API") || plugins[plugin].required;

    const enabledPlugins = Object.keys(plugins)
        .filter(p => isPluginEnabled(p) && !isApiPlugin(p));

    const enabledStockPlugins = enabledPlugins.filter(p => !PluginMeta[p].userPlugin);
    const enabledUserPlugins = enabledPlugins.filter(p => PluginMeta[p].userPlugin);


    let content = `**Enabled Plugins (${enabledStockPlugins.length}):**\n${makeCodeblock(enabledStockPlugins.join(", "))}`;

    if (enabledUserPlugins.length) {
        content += `**Enabled UserPlugins (${enabledUserPlugins.length}):**\n${makeCodeblock(enabledUserPlugins.join(", "))}`;
    }

    return content;
}

const checkForUpdatesOnce = onlyOnce(checkForUpdates);

const settings = definePluginSettings({}).withPrivateSettings<{
    dismissedDevBuildWarning?: boolean;
}>();

export default definePlugin({
    name: "SupportHelper",
    required: true,
    description: "Helps us provide support to you",
    authors: [Devs.Ven],
    dependencies: ["UserSettingsAPI"],

    settings,

    patches: [{
        find: "#{intl::BEGINNING_DM}",
        replacement: {
            match: /#{intl::BEGINNING_DM},{.+?}\),(?=.{0,300}(\i)\.isMultiUserDM)/,
            replace: "$& $self.renderContributorDmWarningCard({ channel: $1 }),"
        }
    }],

    commands: [
        {
            name: "velocity-debug",
            description: "Send Velocity debug info",
            predicate: ctx => isPluginDev(UserStore.getCurrentUser()?.id) || isSupportAllowedChannel(ctx.channel),
            execute: async () => ({ content: await generateDebugInfoMessage() })
        },
        {
            name: "velocity-plugins",
            description: "Send Velocity plugin list",
            predicate: ctx => isPluginDev(UserStore.getCurrentUser()?.id) || isSupportAllowedChannel(ctx.channel),
            execute: () => ({ content: generatePluginList() })
        }
    ],

    flux: {
        async CHANNEL_SELECT({ channelId }) {
            const isSupportChannel = channelId === SUPPORT_CHANNEL_ID || ChannelStore.getChannel(channelId)?.parent_id === SUPPORT_CATEGORY_ID;
            if (!isSupportChannel) return;

            const selfId = UserStore.getCurrentUser()?.id;
            if (!selfId || isPluginDev(selfId)) return;

            if (!IS_UPDATER_DISABLED) {
                await checkForUpdatesOnce().catch(() => { });

                if (isOutdated) {
                    return showAlert({
                        title: "Hold on!",
                        body: <div>
                            <Forms.FormText>You are using an outdated version of Velocity! Chances are, your issue is already fixed.</Forms.FormText>
                            <Forms.FormText className={Margins.top8}>
                                Please first update before asking for support!
                            </Forms.FormText>
                        </div>,
                        onCancel: () => openSettingsTabModal(UpdaterTab!),
                        cancelText: "View Updates",
                        confirmText: "Update & Restart Now",
                        onConfirm: forceUpdate,
                        secondaryConfirmText: "I know what I'm doing or I can't update"
                    });
                }
            }

            const roles = GuildMemberStore.getSelfMember(VELOCITY_GUILD_ID)?.roles;
            if (!roles || TrustedRolesIds.some(id => roles.includes(id))) return;

            if (!IS_WEB && IS_UPDATER_DISABLED) {
                return showAlert({
                    title: "Hold on!",
                    body: <div>
                        <Paragraph>You are using an externally updated Velocity version, which we do not provide support for!</Paragraph>
                    </div>
                });
            }

            if (!IS_STANDALONE && !settings.store.dismissedDevBuildWarning) {
                return showAlert({
                    title: "Hold on!",
                    body: <div>
                        <Paragraph>You are using a custom build of Velocity, which we do not provide support for!</Paragraph>

                        <Text variant="text-md/bold" className={Margins.top8}>You will be banned from receiving support if you ignore this rule.</Text>
                    </div>,
                    confirmText: "Understood",
                    secondaryConfirmText: "Don't show again",
                    onConfirmSecondary: () => settings.store.dismissedDevBuildWarning = true
                });
            }
        }
    },

    renderMessageAccessory(props) {
        const buttons = [] as JSX.Element[];

        const shouldAddUpdateButton =
            !IS_UPDATER_DISABLED
            && (
                (props.channel.id === KNOWN_ISSUES_CHANNEL_ID) ||
                (props.channel.parent_id === SUPPORT_CATEGORY_ID && props.message.author.id === VEBOT_USER_ID)
            )
            && props.message.content?.includes("update");

        const linkRegex = /velocity:\/\/plugins\/([a-zA-Z0-9_-]+)/;
        const match = props.message.content.match(linkRegex);

        if (!match) {
            if (!shouldAddUpdateButton && !props.message.content.includes("/velocity-debug") && !props.message.content.includes("/velocity-plugins")) {
                return null;
            }
        }

        const plugin = match ? Object.values(plugins).find(p => p.name.toLowerCase() === match[1].toLowerCase()) as Plugin : null;
        const [enabled, setEnabled] = useState(plugin ? isPluginEnabled(plugin.name) : false);

        useEffect(() => {
            if (!plugin) return;
            const handler = () => setEnabled(isPluginEnabled(plugin.name));
            SettingsStore.addChangeListener(`plugins.${plugin.name}.enabled`, handler);
            return () => SettingsStore.removeChangeListener(`plugins.${plugin.name}.enabled`, handler);
        }, [plugin?.name]);

        function handleToggle() {
            if (!plugin) return;
            const wasEnabled = isPluginEnabled(plugin.name);

            if (!wasEnabled) {
                const { restartNeeded, failures } = startDependenciesRecursive(plugin);
                if (failures.length) {
                    showToast(`Failed to start dependencies: ${failures.join(", ")}`, Toasts.Type.FAILURE, {
                        position: Toasts.Position.BOTTOM
                    });
                    return;
                }
                if (restartNeeded) {
                    Settings.plugins[plugin.name].enabled = true;
                    showToast("Restart to apply changes");
                    return;
                }
            }

            if (pluginRequiresRestart(plugin)) {
                Settings.plugins[plugin.name].enabled = !wasEnabled;
                showToast("Restart to apply changes");
                return;
            }

            if (wasEnabled && !plugin.started) {
                Settings.plugins[plugin.name].enabled = !wasEnabled;
                return;
            }

            const result = wasEnabled ? stopPlugin(plugin) : startPlugin(plugin);
            if (!result) {
                Settings.plugins[plugin.name].enabled = false;
                showToast(`Error while ${wasEnabled ? "stopping" : "starting"} plugin ${plugin.name}`, Toasts.Type.FAILURE, {
                    position: Toasts.Position.BOTTOM
                });
                return;
            }

            Settings.plugins[plugin.name].enabled = !wasEnabled;
        }

        if (shouldAddUpdateButton) {
            buttons.push(
                <Buttons.Button
                    key="vc-update"
                    variant="active"
                    text="Update Now"
                    onClick={async () => {
                        try {
                            if (await forceUpdate())
                                showToast("Success! Restarting...", Toasts.Type.SUCCESS);
                            else
                                showToast("Already up to date!", Toasts.Type.MESSAGE);
                        } catch (e) {
                            new Logger(this.name).error("Error while updating:", e);
                            showToast("Failed to update :(", Toasts.Type.FAILURE);
                        }
                    }}
                />
            );
        }

        if (props.channel.parent_id === SUPPORT_CATEGORY_ID && PermissionStore.can(PermissionsBits.SEND_MESSAGES, props.channel)) {
            if (props.message.content.includes("/velocity-debug") || props.message.content.includes("/velocity-plugins")) {
                buttons.push(
                    <Buttons.Button
                        key="vc-dbg"
                        onClick={async () => sendMessage(props.channel.id, { content: await generateDebugInfoMessage() })}
                        text="Run /velocity-debug"
                        size="sm"
                    />,
                    <Buttons.Button
                        key="vc-plg-list"
                        onClick={async () => sendMessage(props.channel.id, { content: generatePluginList() })}
                        text="Run /velocity-plugins"
                        size="sm"
                    />
                );
            }
        }

        if (plugin) {
            return (
                <>
                    <Card style={{ padding: "8px 12px", maxWidth: "350px" }} className={classes(Margins.top8, Margins.bottom8)}>
                        <Flex flexDirection="column" gap="12px" >
                            <Flex alignItems="center" gap="12px">
                                <div style={{ flexShrink: 0 }}>
                                    <PluginsIcon color="control-icon-only-icon-default" />
                                </div>
                                <Flex flexDirection="column" gap="4px">
                                    <Text variant="text-md/semibold" >
                                        {plugin.name}{plugin.required && <Span color="text-feedback-critical" style={{ display: "inline", userSelect: "none" }}> *</Span>}
                                    </Text>
                                    <Text lineClamp={2} variant="text-sm/normal" color="text-muted">
                                        {plugin.description}
                                    </Text>
                                </Flex>
                            </Flex>
                            <Buttons.ButtonGroup direction="horizontal" gap="8" >
                                <Buttons.Button fullWidth icon={PluginsIcon} text="View Plugin" size="sm" onClick={() => openPluginModal(plugin)} />
                                {!plugin.required && !plugin.isDependency && <Buttons.Button variant={enabled ? "critical-primary" : "active"} icon={() => <Icons.SettingsIcon color="currentColor" size="xs" />} text={enabled ? "Disable" : "Enable"} size="sm" onClick={handleToggle} />}
                            </Buttons.ButtonGroup>
                        </Flex >
                    </Card >
                    {buttons.length > 0 && <Buttons.ButtonGroup direction="horizontal" gap="8">{buttons}</Buttons.ButtonGroup>}
                </>
            );
        }

        return buttons.length
            ? <Buttons.ButtonGroup direction="horizontal" gap="8">{buttons}</Buttons.ButtonGroup>
            : null;
    },

    renderContributorDmWarningCard: ErrorBoundary.wrap(({ channel }) => {
        const userId = channel.getRecipientId();
        if (!isPluginDev(userId)) return null;
        if (RelationshipStore.isFriend(userId) || isPluginDev(UserStore.getCurrentUser()?.id)) return null;

        return (
            <Card className={`vc-warning-card ${Margins.top8}`}>
                Please do not private message Velocity plugin developers for support!
                <br />
                Instead, use the Velocity support channel: {Parser.parse("https://discord.com/channels/1384314700908462212/1428704586352431124")}
                {!ChannelStore.getChannel(SUPPORT_CHANNEL_ID) && " (Click the link to join)"}
            </Card>
        );
    }, { noop: true })
});
