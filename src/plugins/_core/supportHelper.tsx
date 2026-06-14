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

import { isPluginEnabled, pluginRequiresRestart, plugins, startDependenciesRecursive, startPlugin, stopPlugin } from "@api/PluginManager";
import { definePluginSettings, Settings, SettingsStore } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { Card } from "@components/Card";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { PluginsIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { openPluginModal, openSettingsTabModal, UpdaterTab } from "@components/settings";
import { Span } from "@components/Span";
import SettingsPlugin from "@plugins/_core/settings";
import { gitRemote } from "@shared/userAgent";
import { CONTRIB_ROLE_ID, Devs, DONOR_ROLE_ID, KNOWN_ISSUES_CHANNEL_ID, SUPPORT_CATEGORY_ID, SUPPORT_CHANNEL_ID, TRUSTED_CONTRIB_ROLE_ID, VEBOT_USER_ID, VELOCITY_GUILD_ID } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import { Logger } from "@utils/Logger";
import { classes, isPluginDev, tryOrElse } from "@utils/misc";
import { relaunch } from "@utils/native";
import { onlyOnce } from "@utils/onlyOnce";
import { useForceUpdater } from "@utils/react";
import { makeCodeblock } from "@utils/text";
import definePlugin from "@utils/types";
import { checkForUpdates, isOutdated, update } from "@utils/updater";
import type { Channel, Message, ModalPropsRender } from "@velocity-types";
import { CloudUploadPlatform, MessageFlags } from "@velocity-types/enums";
import { Alerts, Buttons, ChannelStore, CloudUploader, ConfirmModal, Constants, GuildMemberStore, Icons, MessageStore, openModal, Parser, PermissionsBits, PermissionStore, RelationshipStore, RestAPI, SelectedChannelStore, showToast, SnowflakeUtils, Text, Toasts, useEffect, UserStore } from "@webpack/common";
import type { JSX } from "react";

import gitHash from "~git-hash";
import { PluginMeta } from "~plugins";

const logger = new Logger("SupportHelper");

const TrustedRoleIds = new Set([
    CONTRIB_ROLE_ID,
    TRUSTED_CONTRIB_ROLE_ID,
    DONOR_ROLE_ID
]);

const AsyncFunction = async function () { }.constructor;

const PluginLinkRe = /velocity:\/\/plugins\/([a-zA-Z0-9_-]+)/;
const CodeBlockRe = /```(?:js|ts)\n(.+?)```/s;

// Strips sections wrapped in U+2060 (Word Joiner) from Vebot messages,
// Only applies if Velocity is installed, regular users will see the wrapped section.
const StripSectionRe = / ?\u2060[\s\S]*?\u2060/g;

const ShowCurrentGame = getUserSettingLazy<boolean>("status", "showCurrentGame")!;

const isSupportAllowedChannel = (channel: Channel) =>
    channel.parent_id === SUPPORT_CATEGORY_ID;

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
            `v${VERSION} • [${gitHash}](<https://github.com/${gitRemote}/commit/${gitHash}>)` +
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
        "Outdated": !IS_UPDATER_DISABLED && isOutdated,
        "More than two weeks out of date": BUILD_TIMESTAMP < Date.now() - 12096e5
    };

    let content = `>>> ${Object.entries(info).map(([k, v]) => `**${k}**: ${v}`).join("\n")}`;
    content += "\n" + Object.entries(commonIssues)
        .filter(([, v]) => v)
        .map(([k]) => `⚠️ ${k}`)
        .join("\n");

    return content.trim();
}

async function uploadPluginListFile(channelId: string, fileContent: string, filename: string) {
    const file = new File([fileContent], filename, { type: "text/plain" });
    const upload = new CloudUploader({ file, platform: CloudUploadPlatform.WEB }, channelId);

    return new Promise<void>((resolve, reject) => {
        upload.on("complete", () => {
            RestAPI.post({
                url: Constants.Endpoints.MESSAGES(channelId),
                body: {
                    flags: 0,
                    channel_id: channelId,
                    content: `⚠️ Plugin list attached as file due to high plugin count (${fileContent.split("\n").filter(l => l.startsWith("  -")).length} plugins enabled)`,
                    nonce: SnowflakeUtils.fromTimestamp(Date.now()),
                    sticker_ids: [],
                    type: 0,
                    attachments: [{ id: "0", filename: upload.filename, uploaded_filename: upload.uploadedFilename }]
                }
            }).then(() => resolve()).catch(reject);
        });

        upload.on("error", () => reject(new Error("Failed to upload file")));
        upload.upload();
    });
}

type PluginList = string | { fileContent: string; filename: string; };

function generatePluginList(): PluginList {
    const isApiPlugin = (plugin: string) => plugin.endsWith("API") || plugins[plugin].required;

    const enabledPlugins = Object.keys(plugins).filter(p => isPluginEnabled(p) && !isApiPlugin(p));
    const enabledStockPlugins = enabledPlugins.filter(p => !PluginMeta[p].userPlugin).sort();
    const enabledUserPlugins = enabledPlugins.filter(p => PluginMeta[p].userPlugin).sort();
    const user = UserStore.getCurrentUser();

    if (enabledPlugins.length > 100 && !isPluginDev(user.id)) {
        Alerts.show({
            title: "Warning: High Plugin Count",
            body: <div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                    <img src="https://media.tenor.com/QtGqjwBpRzwAAAAi/wumpus-dancing.gif" />
                </div>
                <Paragraph>You have more than 100 plugins enabled.</Paragraph>
                <Paragraph>Due to the sheer amount of plugins, you may not receive support.</Paragraph>
                <Paragraph>Your issue is likely caused by plugin conflicts.</Paragraph>
                <Paragraph>Please consider disabling some plugins to troubleshoot.</Paragraph>
                <Paragraph className={Margins.top8}>Your plugin list will be sent as a text file.</Paragraph>
            </div>
        });

        const lines = [
            `Enabled Stock Plugins (${enabledStockPlugins.length}):`,
            ...enabledStockPlugins.map(p => `  - ${p}`),
            ""
        ];

        if (enabledUserPlugins.length) {
            lines.push(
                `Enabled User Plugins (${enabledUserPlugins.length}):`,
                ...enabledUserPlugins.map(p => `  - ${p}`),
                ""
            );
        }

        lines.push("---", `Total Enabled Plugins: ${enabledPlugins.length}`);

        return { fileContent: lines.join("\n"), filename: `${user.username}-plugins.txt` };
    }

    let content = `**Enabled Plugins (${enabledStockPlugins.length}):**\n${makeCodeblock(enabledStockPlugins.join(", "))}`;
    if (enabledUserPlugins.length)
        content += `**Enabled UserPlugins (${enabledUserPlugins.length}):**\n${makeCodeblock(enabledUserPlugins.join(", "))}`;

    return content;
}

async function sendPluginList(channelId: string) {
    const pluginList = generatePluginList();

    if (typeof pluginList === "string") {
        sendMessage(channelId, { content: pluginList });
        return;
    }

    try {
        await uploadPluginListFile(channelId, pluginList.fileContent, pluginList.filename);
        showToast("Plugin list uploaded successfully!", Toasts.Type.SUCCESS);
    } catch (e) {
        logger.error("Failed to upload plugin list:", e);
        showToast("Failed to upload plugin list", Toasts.Type.FAILURE);
    }
}

function stripHiddenContent(msg: Message | Message[]) {
    if (Array.isArray(msg)) { msg.forEach(stripHiddenContent); return; }
    const stored = MessageStore.getMessage(msg.channel_id, msg.id) ?? msg;
    if (!stored?.content || !StripSectionRe.test(stored.content)) return;

    StripSectionRe.lastIndex = 0;
    stored.content = stored.content.replace(StripSectionRe, "").trim();
}

const checkForUpdatesOnce = onlyOnce(checkForUpdates);

const settings = definePluginSettings({}).withPrivateSettings<{
    dismissedDevBuildWarning?: boolean;
}>();

function DevBuildConfirmModal(props: ModalPropsRender) {
    const s = settings.use(["dismissedDevBuildWarning"]);

    return (
        <ConfirmModal
            {...props}
            title="Hold on!"
            confirmText="Understood"
            variant="primary"
            actionsFullWidth
            checkboxProps={{
                checked: s.dismissedDevBuildWarning === true,
                onChange: checked => s.dismissedDevBuildWarning = checked
            }}
        >
            <div>
                <Paragraph>You are using a custom build of Velocity, which we do not provide support for!</Paragraph>
                <Paragraph className={Margins.top8}>We only provide support for official builds</Paragraph>
                <Text variant="text-md/bold" className={Margins.top8}>You will be banned from receiving support if you ignore this rule.</Text>
            </div>
        </ConfirmModal>
    );
}

export default definePlugin({
    name: "SupportHelper",
    required: true,
    description: "Helps us provide support to you",
    authors: [Devs.Ven, Devs.Rift],
    dependencies: ["UserSettingsAPI"],

    settings,

    patches: [{
        find: "#{intl::BEGINNING_DM}",
        replacement: {
            match: /#{intl::BEGINNING_DM},{.+?}\),(?=.{0,300}(\i)\.isMultiUserDM)/,
            replace: "$& $self.renderContributorDmWarningCard({ channel: $1 }),"
        }
    },
    {
        find: "#{intl::FORUM_FOLLOW_TOOLTIP}",
        replacement: {
            match: /("Forum Toolbar"\)\s*\}\s*\}\s*\)\s*\}\s*\))/,
            replace: "$1,$self.renderOpenDevtoolsButton()"
        },
        predicate: () => !IS_DISCORD_DESKTOP
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
            execute: async () => {
                const pluginList = generatePluginList();
                if (typeof pluginList === "string") return { content: pluginList };

                try {
                    await uploadPluginListFile(SelectedChannelStore.getChannelId(), pluginList.fileContent, pluginList.filename);
                    return { content: "" };
                } catch (e) {
                    logger.error("Failed to upload plugin list:", e);
                    return { content: "Failed to upload plugin list file. Please try again." };
                }
            }
        }
    ],

    flux: {
        MESSAGE_CREATE({ message }: { message: Message; }) {
            stripHiddenContent(message);
        },

        MESSAGE_UPDATE({ message }: { message: Message; }) {
            stripHiddenContent(message);
        },

        LOAD_MESSAGES_SUCCESS({ messages }: { messages: Message[]; }) {
            stripHiddenContent(messages);
        },

        async CHANNEL_SELECT({ channelId }) {
            const isSupportChannel = channelId === SUPPORT_CHANNEL_ID || ChannelStore.getChannel(channelId)?.parent_id === SUPPORT_CATEGORY_ID;
            if (!isSupportChannel) return;

            const selfId = UserStore.getCurrentUser()?.id;
            if (!selfId || isPluginDev(selfId)) return;

            if (!IS_UPDATER_DISABLED) {
                await checkForUpdatesOnce().catch(() => { });

                if (isOutdated) {
                    openModal(props => (
                        <ConfirmModal
                            {...props}
                            title="Hold on!"
                            onCancel={() => openSettingsTabModal(UpdaterTab!)}
                            cancelText="View Updates"
                            confirmText="Update & Restart Now"
                            onConfirm={forceUpdate}
                        >
                            <div>
                                <Paragraph>You are using an outdated version of Velocity! Chances are, your issue is already fixed.</Paragraph>
                                <Paragraph className={Margins.top8}>Please first update before asking for support!</Paragraph>
                                <Paragraph className={Margins.top8}>If you know what you're doing or cannot update, you can dismiss this prompt.</Paragraph>
                            </div>
                        </ConfirmModal>
                    ));
                    return;
                }
            }

            const roles = GuildMemberStore.getSelfMember(VELOCITY_GUILD_ID)?.roles;
            if (!roles || roles.some(id => TrustedRoleIds.has(id))) return;

            if (!IS_WEB && IS_UPDATER_DISABLED) {
                openModal(props => (
                    <ConfirmModal {...props} title="Hold on!" confirmText="OK" variant="primary">
                        <div>
                            <Paragraph>You are using an externally updated Velocity version, which we do not provide support for!</Paragraph>
                            <Paragraph className={Margins.top8}>
                                Please either switch to an officially supported version of Velocity, or contact your package maintainer for support instead.
                            </Paragraph>
                        </div>
                    </ConfirmModal>
                ));
                return;
            }

            if (!IS_STANDALONE && !settings.store.dismissedDevBuildWarning)
                openModal(props => <DevBuildConfirmModal {...props} />);
        }
    },

    renderMessageAccessory(props) {
        const match = props.message.content.match(PluginLinkRe);
        const hasDebugCommand = props.message.content.includes("/velocity-debug") || props.message.content.includes("/velocity-plugins");
        const shouldAddUpdateButton =
            !IS_UPDATER_DISABLED &&
            (props.channel.id === KNOWN_ISSUES_CHANNEL_ID || (props.channel.parent_id === SUPPORT_CATEGORY_ID && props.message.author.id === VEBOT_USER_ID)) &&
            props.message.content?.includes("update") &&
            props.message.flags !== MessageFlags.EPHEMERAL;

        const plugin = match ? Object.values(plugins).find(p => p.name.toLowerCase() === match[1].toLowerCase()) ?? null : null;

        const update = useForceUpdater();
        useEffect(() => {
            if (!plugin) return;
            SettingsStore.addPrefixChangeListener(`plugins.${plugin.name}`, update);
            return () => SettingsStore.removePrefixChangeListener(`plugins.${plugin.name}`, update);
        }, [plugin?.name]);

        const enabled = !!plugin && isPluginEnabled(plugin.name);

        function handleToggle() {
            if (!plugin) return;
            const wasEnabled = isPluginEnabled(plugin.name);

            if (!wasEnabled) {
                const { restartNeeded, failures } = startDependenciesRecursive(plugin);
                if (failures.length) {
                    showToast(`Failed to start dependencies: ${failures.join(", ")}`, Toasts.Type.FAILURE, { position: Toasts.Position.BOTTOM });
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
                showToast(`Error while ${wasEnabled ? "stopping" : "starting"} plugin ${plugin.name}`, Toasts.Type.FAILURE, { position: Toasts.Position.BOTTOM });
                return;
            }

            Settings.plugins[plugin.name].enabled = !wasEnabled;
        }

        const buttons: JSX.Element[] = [];

        if (shouldAddUpdateButton) {
            buttons.push(
                <Buttons.Button
                    text="Update Now"
                    variant="active"
                    icon={Icons.DownloadIcon}
                    size="sm"
                    onClick={async () => {
                        try {
                            if (await forceUpdate())
                                showToast("Success! Restarting...", Toasts.Type.SUCCESS);
                            else
                                showToast("Already up to date!", Toasts.Type.MESSAGE);
                        } catch (e) {
                            logger.error("Error while updating:", e);
                            showToast("Failed to update :(", Toasts.Type.FAILURE);
                        }
                    }}
                />
            );
        }

        if (props.channel.parent_id === KNOWN_ISSUES_CHANNEL_ID || (props.channel.parent_id === SUPPORT_CATEGORY_ID && props.message.author.id === VEBOT_USER_ID)) {
            const match = CodeBlockRe.exec(props.message.content || props.message.embeds[0]?.rawDescription || "");
            if (match) {
                buttons.push(
                    <Buttons.Button
                        text="Run Snippet"
                        icon={Icons.BugIcon}
                        size="sm"
                        onClick={async () => {
                            try {
                                await AsyncFunction(match[1])();
                                showToast("Success!", Toasts.Type.SUCCESS);
                            } catch (e) {
                                new Logger(this.name).error("Error while running snippet:", e);
                                showToast("Failed to run snippet :(", Toasts.Type.FAILURE);
                            }
                        }}
                    />
                );
            }
        }

        if (hasDebugCommand && props.channel.parent_id === SUPPORT_CATEGORY_ID && PermissionStore.can(PermissionsBits.SEND_MESSAGES, props.channel)) {
            buttons.push(
                <Buttons.Button
                    onClick={async () => sendMessage(props.channel.id, { content: await generateDebugInfoMessage() })}
                    icon={Icons.SlashBoxIcon}
                    text="Run /velocity-debug"
                    size="sm"
                />,
                <Buttons.Button
                    onClick={() => sendPluginList(props.channel.id)}
                    icon={Icons.SlashBoxIcon}
                    text="Run /velocity-plugins"
                    size="sm"
                />
            );
        }

        if (!plugin && !buttons.length) return null;

        const buttonGroup = buttons.length > 0 && <Buttons.ButtonGroup direction="horizontal" gap="8">{buttons}</Buttons.ButtonGroup>;

        if (!plugin) return buttonGroup;

        return (
            <>
                <Card style={{ padding: "8px 12px", maxWidth: "350px" }} className={classes(Margins.top8, Margins.bottom8)}>
                    <Flex flexDirection="column" gap="12px">
                        <Flex alignItems="center" gap="12px">
                            <div style={{ flexShrink: 0 }}>
                                <PluginsIcon color="control-icon-only-icon-default" />
                            </div>
                            <Flex flexDirection="column" gap="4px">
                                <Text variant="text-md/semibold">
                                    {plugin.name}{plugin.required && <Span color="text-feedback-critical" selectable={false}> *</Span>}
                                </Text>
                                <Text lineClamp={2} variant="text-sm/normal" color="text-muted">
                                    {plugin.description}
                                </Text>
                            </Flex>
                        </Flex>
                        <Buttons.ButtonGroup direction="horizontal" gap="8">
                            <Buttons.Button fullWidth icon={PluginsIcon} text="View Plugin" size="sm" onClick={() => openPluginModal(plugin)} />
                            {!plugin.required && !plugin.isDependency && (
                                <Buttons.Button
                                    variant={enabled ? "critical-primary" : "active"}
                                    icon={() => <Icons.SettingsIcon color="currentColor" size="xs" />}
                                    text={enabled ? "Disable" : "Enable"}
                                    size="sm"
                                    onClick={handleToggle}
                                />
                            )}
                        </Buttons.ButtonGroup>
                    </Flex>
                </Card>
                {buttonGroup}
            </>
        );
    },

    renderOpenDevtoolsButton() {
        if (!IS_DISCORD_DESKTOP) return null;

        return (
            <Buttons.Button
                text="DevTools"
                icon={Icons.BugIcon}
                size="sm"
                variant="secondary"
                onClick={() => VelocityNative.native.openDevTools()}
            />
        );
    },

    renderContributorDmWarningCard: ErrorBoundary.wrap(({ channel }) => {
        const userId = channel.getRecipientId();
        if (!isPluginDev(userId)) return null;
        if (RelationshipStore.isFriend(userId) || isPluginDev(UserStore.getCurrentUser()?.id)) return null;

        return (
            <Card className={`vc-warning-card ${Margins.top8}`}>
                Please do not private message Velocity plugin developers for support!
                <br />
                Instead, use the Velocity support channel: {Parser.parse(`https://discord.com/channels/${VELOCITY_GUILD_ID}/${SUPPORT_CHANNEL_ID}`)}
                {!ChannelStore.getChannel(SUPPORT_CHANNEL_ID) && " (Click the link to join)"}
            </Card>
        );
    }, { noop: true })
});
