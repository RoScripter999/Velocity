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

import { isPluginEnabled } from "@api/PluginManager";
import ErrorBoundary from "@components/ErrorBoundary";
import ShowHiddenChannelsPlugin from "@plugins/showHiddenChannels";
import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import type { Channel } from "@velocity-types";
import { findCssClassesLazy } from "@webpack";
import { ChannelActions, ChannelRouter, ChannelStore, Icons, Parser, PermissionsBits, PermissionStore, showToast, Text, Toasts, Tooltip, useMemo, UserStore, UserSummaryItem, useStateFromStores, VoiceStateStore } from "@webpack/common";
import type { MouseEvent } from "react";

const cl = classNameFactory("vc-uvs-");

const ActionButtonClasses = findCssClassesLazy("actionButton", "highlight");

interface VoiceChannelTooltipProps {
    channel: Channel;
    isLocked: boolean;
}

function VoiceChannelTooltip({ channel, isLocked }: VoiceChannelTooltipProps) {
    const voiceStates = useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStatesForChannel(channel.id));

    const users = useMemo(
        () => Object.values(voiceStates).map(voiceState => UserStore.getUser(voiceState.userId)).filter(user => user != null),
        [voiceStates]
    );

    const Icon = isLocked ? Icons.VoiceLockIcon : Icons.VoiceNormalIcon;
    return (
        <>
            <Text variant="text-sm/bold">In Voice Chat</Text>
            <Text variant="text-sm/bold">{Parser.parse(`<#${channel.id}>`)}</Text>
            <div className={cl("vc-members")}>
                <Icon size="sm" />
                <UserSummaryItem
                    users={users}
                    renderIcon={false}
                    max={13}
                    size={18}
                />
            </div>
        </>
    );
}

export interface VoiceChannelIndicatorProps {
    userId: string;
    isProfile?: boolean;
    isMessage?: boolean;
    isActionButton?: boolean;
    shouldHighlight?: boolean;
}

const clickTimers = new Map<string, any>();

export const VoiceChannelIndicator = ErrorBoundary.wrap(({ userId, isProfile, isMessage, isActionButton, shouldHighlight }: VoiceChannelIndicatorProps) => {
    const channelId = useStateFromStores([VoiceStateStore], () => VoiceStateStore.getVoiceStateForUser(userId)?.channelId);

    const { isMuted, isDeaf } = useStateFromStores([VoiceStateStore], () => {
        const voiceState = VoiceStateStore.getVoiceStateForUser(userId);
        return {
            isMuted: voiceState?.mute || voiceState?.selfMute || false,
            isDeaf: voiceState?.deaf || voiceState?.selfDeaf || false
        };
    });

    const channel = channelId == null ? undefined : ChannelStore.getChannel(channelId);
    if (channel == null) return null;

    const isDM = channel.isDM() || channel.isMultiUserDM();
    if (!isDM && !PermissionStore.can(PermissionsBits.VIEW_CHANNEL, channel) && !isPluginEnabled(ShowHiddenChannelsPlugin.name)) return null;

    const isLocked = !isDM && (!PermissionStore.can(PermissionsBits.VIEW_CHANNEL, channel) || !PermissionStore.can(PermissionsBits.CONNECT, channel));

    function onClick(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (channel == null || channelId == null) return;

        clearTimeout(clickTimers.get(channelId));
        clickTimers.delete(channelId);

        if (e.detail > 1) {
            if (!isDM && !PermissionStore.can(PermissionsBits.CONNECT, channel)) {
                showToast("You cannot join the user's Voice Channel", Toasts.Type.FAILURE);
                return;
            }

            ChannelActions.selectVoiceChannel(channelId);
        } else {
            const timeoutId = setTimeout(() => {
                ChannelRouter.transitionToChannel(channelId);
                clickTimers.delete(channelId);
            }, 250);
            clickTimers.set(channelId, timeoutId);
        }
    }

    const IconComponent =
        isLocked
            ? Icons.VoiceLockIcon
            : isDeaf
                ? Icons.HeadphonesSlashIcon
                : isMuted
                    ? Icons.MicrophoneSlashIcon
                    : Icons.VoiceNormalIcon;

    return (
        <Tooltip
            text={<VoiceChannelTooltip channel={channel} isLocked={isLocked} />}
            tooltipClassName={cl("tooltip-container")}
            tooltipContentClassName={cl("tooltip-content")}
        >
            {props => (
                <IconComponent
                    {...props}
                    role="button"
                    onClick={onClick}
                    className={classes(
                        cl("clickable"),
                        isActionButton && ActionButtonClasses.actionButton,
                        isActionButton && shouldHighlight && ActionButtonClasses.highlight,
                        cl(isProfile && "profile-speaker")
                    )}
                    size={(isActionButton || isMessage) ? "refresh_sm" : "xs"}
                />
            )}
        </Tooltip>
    );
}, { noop: true });
