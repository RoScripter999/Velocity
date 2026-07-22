/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 RoScripter999 and contributors
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

import { getCurrentChannel } from "@utils/discord";
import { isObjectEmpty } from "@utils/misc";
import { ChannelMemberStore, ChannelStore, GuildMemberCountStore, PermissionsBits, PermissionStore, SelectedChannelStore, ThreadMemberListStore, Tooltip, useEffect, useStateFromStores, VoiceStateStore } from "@webpack/common";

import { cl, numberFormat, settings } from ".";
import { CircleIcon } from "./CircleIcon";
import { OnlineMemberCountStore } from "./OnlineMemberCountStore";
import { VoiceIcon } from "./VoiceIcon";

export function MemberCount({ isTooltip, tooltipGuildId }: { isTooltip?: true; tooltipGuildId?: string; }) {
    const { voiceActivity } = settings.use(["voiceActivity"]);
    const includeVoice = voiceActivity && !isTooltip;

    const currentChannel = useStateFromStores(
        [SelectedChannelStore],
        () => isTooltip ? undefined : getCurrentChannel(),
        [],
        (a, b) => a?.id === b?.id
    );

    const guildId = tooltipGuildId ?? currentChannel?.guild_id;

    const voiceActivityCount = useStateFromStores(
        [VoiceStateStore],
        () => {
            if (!includeVoice || !guildId) return 0;

            const voiceStates = VoiceStateStore.getVoiceStates(guildId);
            if (!voiceStates) return 0;

            return Object.values(voiceStates)
                .filter(({ channelId }) => {
                    if (!channelId) return false;

                    const channel = ChannelStore.getChannel(channelId);
                    return channel && PermissionStore.can(PermissionsBits.VIEW_CHANNEL, channel);
                })
                .length;
        }
    );

    const totalCount = useStateFromStores(
        [GuildMemberCountStore],
        () => guildId ? GuildMemberCountStore.getMemberCount(guildId) : null
    );

    let onlineCount = useStateFromStores(
        [OnlineMemberCountStore],
        () => guildId ? OnlineMemberCountStore.getCount(guildId) : null
    );

    const memberListOnlineCount = useStateFromStores(
        [ChannelMemberStore],
        () => {
            if (isTooltip || !guildId) return null;

            const { groups } = ChannelMemberStore.getProps(guildId, currentChannel?.id!);

            if (groups.length >= 1 || groups[0].id !== "unknown") {
                return groups.reduce(
                    (total, curr) => total + (curr.id === "offline" ? 0 : curr.count),
                    0
                );
            }

            return null;
        }
    );

    const threadListOnlineCount = useStateFromStores(
        [ThreadMemberListStore],
        () => {
            if (isTooltip) return null;

            const threadGroups = ThreadMemberListStore.getMemberListSections(currentChannel?.id!);

            if (threadGroups && !isObjectEmpty(threadGroups)) {
                return Object.values(threadGroups).reduce(
                    (total, curr) => total + (curr.sectionId === "offline" ? 0 : curr.userIds.length),
                    0
                );
            }

            return null;
        }
    );

    if (memberListOnlineCount != null) onlineCount = memberListOnlineCount;
    if (threadListOnlineCount != null) onlineCount = threadListOnlineCount;

    useEffect(() => {
        if (guildId) {
            OnlineMemberCountStore.ensureCount(guildId);
        }
    }, [guildId]);

    if (totalCount == null)
        return null;

    const formattedVoiceCount = numberFormat(voiceActivityCount ?? 0);
    const formattedOnlineCount = onlineCount != null ? numberFormat(onlineCount) : "?";

    return (
        <div className={cl("widget", { tooltip: isTooltip, "member-list": !isTooltip })}>
            <Tooltip text={`${formattedOnlineCount} online in this channel`} position="bottom">
                {props => (
                    <div {...props} className={cl("container")}>
                        <CircleIcon className={cl("online-count")} />
                        <span className={cl("online-count")}>{formattedOnlineCount}</span>
                    </div>
                )}
            </Tooltip>

            <Tooltip text={`${numberFormat(totalCount)} total server members`} position="bottom">
                {props => (
                    <div {...props} className={cl("container")}>
                        <CircleIcon className={cl("total-count")} />
                        <span className={cl("total")}>{numberFormat(totalCount)}</span>
                    </div>
                )}
            </Tooltip>

            {includeVoice && voiceActivityCount > 0 &&
                <Tooltip text={`${formattedVoiceCount} members in voice`} position="bottom">
                    {props => (
                        <div {...props} className={cl("container")}>
                            <VoiceIcon className={cl("voice-icon")} />
                            <span className={cl("voice")}>{formattedVoiceCount}</span>
                        </div>
                    )}
                </Tooltip>
            }
        </div>
    );
}
