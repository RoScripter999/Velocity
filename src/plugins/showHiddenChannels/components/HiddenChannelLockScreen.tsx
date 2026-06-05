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
import PermissionsViewerPlugin from "@plugins/permissionsViewer";
import openRolesAndUsersPermissionsModal, { RoleOrUserPermission } from "@plugins/permissionsViewer/components/RolesAndUsersPermissions";
import { sortPermissionOverwrites } from "@plugins/permissionsViewer/utils";
import { classes } from "@utils/misc";
import { formatDuration } from "@utils/text";
import type { Channel } from "@velocity-types";
import { ChannelFlags, ChannelType } from "@velocity-types/enums";
import { findByPropsLazy, findComponentByCodeLazy, findCssClassesLazy } from "@webpack";
import { EmojiStore, EmojiUtils, FluxDispatcher, GuildMemberStore, GuildStore, Icons, Parser, PermissionsBits, PermissionStore, SnowflakeUtils, Text, Timestamp, Tooltip, useEffect, useState } from "@webpack/common";
import type { ComponentType } from "react";

import { cl, settings } from "..";

const enum SortOrderTypes {
    LATEST_ACTIVITY = 0,
    CREATION_DATE = 1
}

const enum ForumLayoutTypes {
    DEFAULT = 0,
    LIST = 1,
    GRID = 2
}

const enum VideoQualityModes {
    AUTO = 1,
    FULL = 2
}

const ChatScrollClasses = findCssClassesLazy("auto", "managedReactiveScroller", "customTheme");
const TagComponent = findComponentByCodeLazy("#{intl::FORUM_TAG_A11Y_FILTER_BY_TAG}");

let ChannelBeginHeader: ComponentType<any> = () => null;
export const setChannelBeginHeader = v => ChannelBeginHeader = v;


const EmojiParser = findByPropsLazy("convertSurrogateToName");

const ChannelTypesToChannelNames = {
    [ChannelType.GUILD_TEXT]: "text",
    [ChannelType.GUILD_ANNOUNCEMENT]: "announcement",
    [ChannelType.GUILD_FORUM]: "forum",
    [ChannelType.GUILD_VOICE]: "voice",
    [ChannelType.GUILD_STAGE_VOICE]: "stage"
};

const SortOrderTypesToNames = {
    [SortOrderTypes.LATEST_ACTIVITY]: "Latest activity",
    [SortOrderTypes.CREATION_DATE]: "Creation date"
};

const ForumLayoutTypesToNames = {
    [ForumLayoutTypes.DEFAULT]: "Not set",
    [ForumLayoutTypes.LIST]: "List view",
    [ForumLayoutTypes.GRID]: "Gallery view"
};

const VideoQualityModesToNames = {
    [VideoQualityModes.AUTO]: "Automatic",
    [VideoQualityModes.FULL]: "720p"
};

// Icon from the modal when clicking a message link you don't have access to view
const HiddenChannelLogo = "/assets/433e3ec4319a9d11b0cbe39342614982.svg";

function HiddenChannelLockScreen({ channel }: { channel: Channel; }) {
    const { defaultAllowedUsersAndRolesDropdownState } = settings.use(["defaultAllowedUsersAndRolesDropdownState"]);
    const [permissions, setPermissions] = useState<RoleOrUserPermission[]>([]);

    const {
        type,
        topic,
        lastMessageId,
        defaultForumLayout,
        lastPinTimestamp,
        defaultAutoArchiveDuration,
        availableTags,
        id: channelId,
        rateLimitPerUser,
        defaultThreadRateLimitPerUser,
        defaultSortOrder,
        defaultReactionEmoji,
        bitrate,
        rtcRegion,
        videoQualityMode,
        permissionOverwrites,
        guild_id
    } = channel;

    useEffect(() => {
        const membersToFetch: Array<string> = [];

        const guildOwnerId = GuildStore.getGuild(guild_id)?.ownerId;
        if (!GuildMemberStore.getMember(guild_id, guildOwnerId)) membersToFetch.push(guildOwnerId);

        Object.values(permissionOverwrites).forEach(({ type, id: userId }) => {
            if (type === 1 && !GuildMemberStore.getMember(guild_id, userId)) {
                membersToFetch.push(userId);
            }
        });

        if (membersToFetch.length > 0) {
            FluxDispatcher.dispatch({
                type: "GUILD_MEMBERS_REQUEST",
                guildIds: [guild_id],
                userIds: membersToFetch
            });
        }

        if (isPluginEnabled(PermissionsViewerPlugin.name)) {
            setPermissions(sortPermissionOverwrites(Object.values(permissionOverwrites).map(overwrite => ({
                type: overwrite.type as any,
                id: overwrite.id,
                overwriteAllow: overwrite.allow,
                overwriteDeny: overwrite.deny
            })), guild_id));
        }
    }, [channelId]);

    return (
        <div className={classes(ChatScrollClasses.auto, ChatScrollClasses.customTheme, ChatScrollClasses.managedReactiveScroller)}>
            <div className={cl("container")}>
                <img className={cl("logo")} src={HiddenChannelLogo} />

                <div className={cl("heading-container")}>
                    <Text variant="heading-xxl/bold">This is a fucking {!PermissionStore.can(PermissionsBits.VIEW_CHANNEL, channel) ? "hidden" : "locked"} {ChannelTypesToChannelNames[type]} channel</Text>
                    {channel.isNSFW() &&
                        <Tooltip text="NSFW">
                            {({ onMouseLeave, onMouseEnter }) => (
                                <Icons.WarningIcon onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} />
                            )}
                        </Tooltip>
                    }
                </div>

                {(!channel.isGuildVoice() && !channel.isGuildStageVoice()) && (
                    <Text variant="text-lg/normal">
                        You can not see the {channel.isForumChannel() ? "posts" : "messages"} of this channel.
                        {channel.isForumChannel() && topic && topic.length > 0 && " However you may see its guidelines:"}
                    </Text >
                )}

                {channel.isForumChannel() && topic && topic.length > 0 && (
                    <div className={cl("topic-container")}>
                        {Parser.parseTopic(topic, false, { channelId })}
                    </div>
                )}

                {lastMessageId &&
                    <Text variant="text-md/normal">
                        Last {channel.isForumChannel() ? "post" : "message"} created:
                        <Timestamp timestamp={new Date(SnowflakeUtils.extractTimestamp(lastMessageId))} />
                    </Text>
                }
                {lastPinTimestamp &&
                    <Text variant="text-md/normal">Last message pin: <Timestamp timestamp={new Date(lastPinTimestamp)} /></Text>
                }
                {(rateLimitPerUser ?? 0) > 0 &&
                    <Text variant="text-md/normal">Slowmode: {formatDuration(rateLimitPerUser!, "seconds")}</Text>
                }
                {(defaultThreadRateLimitPerUser ?? 0) > 0 &&
                    <Text variant="text-md/normal">
                        Default thread slowmode: {formatDuration(defaultThreadRateLimitPerUser!, "seconds")}
                    </Text>
                }
                {((channel.isGuildVoice() || channel.isGuildStageVoice()) && bitrate != null) &&
                    <Text variant="text-md/normal">Bitrate: {bitrate} bits</Text>
                }
                {rtcRegion !== undefined &&
                    <Text variant="text-md/normal">Region: {rtcRegion ?? "Automatic"}</Text>
                }
                {(channel.isGuildVoice() || channel.isGuildStageVoice()) &&
                    <Text variant="text-md/normal">Video quality mode: {VideoQualityModesToNames[videoQualityMode ?? VideoQualityModes.AUTO]}</Text>
                }
                {(defaultAutoArchiveDuration ?? 0) > 0 &&
                    <Text variant="text-md/normal">
                        Default inactivity duration before archiving {channel.isForumChannel() ? "posts" : "threads"}:
                        {" " + formatDuration(defaultAutoArchiveDuration!, "minutes")}
                    </Text>
                }
                {defaultForumLayout != null &&
                    <Text variant="text-md/normal">Default layout: {ForumLayoutTypesToNames[defaultForumLayout]}</Text>
                }
                {defaultSortOrder != null &&
                    <Text variant="text-md/normal">Default sort order: {SortOrderTypesToNames[defaultSortOrder]}</Text>
                }
                {defaultReactionEmoji != null &&
                    <div className={cl("default-emoji-container")}>
                        <Text variant="text-md/normal">Default reaction emoji:</Text>
                        {Parser.defaultRules[defaultReactionEmoji.emojiName ? "emoji" : "customEmoji"].react({
                            name: defaultReactionEmoji.emojiName
                                ? EmojiParser.convertSurrogateToName(defaultReactionEmoji.emojiName)
                                : EmojiStore.getCustomEmojiById(defaultReactionEmoji.emojiId)?.name ?? "",
                            emojiId: defaultReactionEmoji.emojiId ?? void 0,
                            surrogate: defaultReactionEmoji.emojiName ?? void 0,
                            src: defaultReactionEmoji.emojiName
                                ? EmojiUtils.getURL(defaultReactionEmoji.emojiName)
                                : void 0
                        }, void 0, { key: 0 })}
                    </div>
                }
                {channel.hasFlag(ChannelFlags.REQUIRE_TAG) &&
                    <Text variant="text-md/normal">Posts on this forum require a tag to be set.</Text>
                }
                {availableTags && availableTags.length > 0 &&
                    <div className={cl("tags-container")}>
                        <Text variant="text-lg/bold">Available tags:</Text>
                        <div className={cl("tags")}>
                            {availableTags.map(tag => <TagComponent tag={tag} key={tag.id} />)}
                        </div>
                    </div>
                }
                <div className={cl("allowed-users-and-roles-container")}>
                    <div className={cl("allowed-users-and-roles-container-title")}>
                        {isPluginEnabled(PermissionsViewerPlugin.name) && (
                            <Tooltip text="Permission Details">
                                {({ onMouseLeave, onMouseEnter }) => (
                                    <button
                                        onMouseLeave={onMouseLeave}
                                        onMouseEnter={onMouseEnter}
                                        className={cl("allowed-users-and-roles-container-permdetails-btn")}
                                        onClick={() => openRolesAndUsersPermissionsModal(permissions, GuildStore.getGuild(channel.guild_id), channel.name)}
                                    >
                                        <Icons.MoreHorizontalIcon size="refresh_sm" />
                                    </button>
                                )}
                            </Tooltip>
                        )}
                        <Text variant="text-lg/bold">Allowed users and roles:</Text>
                        <Tooltip text={defaultAllowedUsersAndRolesDropdownState ? "Hide Allowed Users and Roles" : "View Allowed Users and Roles"}>
                            {({ onMouseLeave, onMouseEnter }) => (
                                <button
                                    onMouseLeave={onMouseLeave}
                                    onMouseEnter={onMouseEnter}
                                    className={cl("allowed-users-and-roles-container-toggle-btn")}
                                    onClick={() => settings.store.defaultAllowedUsersAndRolesDropdownState = !defaultAllowedUsersAndRolesDropdownState}
                                >
                                    {defaultAllowedUsersAndRolesDropdownState ? <Icons.ChevronSmallDownIcon /> : <Icons.ChevronSmallUpIcon />}
                                </button>
                            )}
                        </Tooltip>
                    </div>
                    {defaultAllowedUsersAndRolesDropdownState && <ChannelBeginHeader channel={channel} />}
                </div>
            </div>
        </div>
    );
}

export default ErrorBoundary.wrap(HiddenChannelLockScreen);
