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

import { SectionHeader } from "@components/settings";
import { classNameFactory } from "@utils/css";
import { getGuildAcronym, openImageModal, openUserProfile } from "@utils/discord";
import { classes } from "@utils/misc";
import { useAwaiter } from "@utils/react";
import type { Guild, GuildFeatures, ModalPropsRender, User } from "@velocity-types";
import { findComponentByCodeLazy, findCssClassesLazy } from "@webpack";
import { FluxDispatcher, Forms, GuildChannelStore, GuildMemberStore, GuildRoleStore, IconUtils, Modal, openModal, Parser, PresenceStore, RelationshipStore, ScrollerThin, SnowflakeUtils, TabBar, Text, Timestamp, useEffect, UserStore, UserUtils, useState, useStateFromStores } from "@webpack/common";

const IconClasses = findCssClassesLazy("icon", "acronym", "childWrapper");
const FriendRow = findComponentByCodeLazy("discriminatorClass:", ".isMobileOnline", "avatarSrc:");
const MaskedLink = findComponentByCodeLazy("MASKED_LINK");

const cl = classNameFactory("vc-gp-");

export function openGuildInfoModal(guild: Guild) {
    openModal(props => <GuildInfoModal guild={guild} modalProps={props} />);
}

const enum Tabs {
    ServerInfo,
    Friends,
    BlockedUsers,
    IgnoredUsers
}

interface GuildProps {
    guild: Guild;
}

interface RelationshipProps extends GuildProps {
    setCount(count: number): void;
}

const fetched = {
    friends: false,
    blocked: false,
    ignored: false
};

function renderTimestamp(timestamp: number) {
    return (
        <Timestamp timestamp={new Date(timestamp)} />
    );
}

function GuildInfoModal({ guild, modalProps }: GuildProps & { modalProps: ModalPropsRender; }) {
    const [friendCount, setFriendCount] = useState<number>();
    const [blockedCount, setBlockedCount] = useState<number>();
    const [ignoredCount, setIgnoredCount] = useState<number>();

    const [currentTab, setCurrentTab] = useState(Tabs.ServerInfo);

    const bannerUrl = guild.banner && IconUtils.getGuildBannerURL(guild, true)!.replace(/\?size=\d+$/, "?size=1024");

    const iconUrl = guild.icon && IconUtils.getGuildIconURL({
        id: guild.id,
        icon: guild.icon,
        canAnimate: true,
        size: 512
    });

    return (
        <Modal
            {...modalProps}
            size="lg"
            title={<SectionHeader
                tag="h2"
                layout="horizontal"
                title={guild?.name}
                description={guild.description ?? undefined}
                icon={() => (
                    <div className={cl("header")}>
                        {iconUrl ? (
                            <img
                                className={cl("icon")}
                                src={iconUrl}
                                alt=""
                                onClick={() => openImageModal({
                                    url: iconUrl,
                                    height: 512,
                                    width: 512
                                })}
                            />
                        ) : (
                            <div aria-hidden className={classes(IconClasses.childWrapper, IconClasses.acronym)}>
                                {getGuildAcronym(guild)}
                            </div>
                        )}
                    </div>
                )}
            />
            }
        >
            {bannerUrl && currentTab === Tabs.ServerInfo && (
                <img
                    className={cl("banner")}
                    src={bannerUrl}
                    alt=""
                    onClick={() => openImageModal({
                        url: bannerUrl,
                        width: 1024
                    })}
                />
            )}

            <TabBar
                type="top"
                look="brand"
                className={cl("tab-bar")}
                selectedItem={currentTab}
                onItemSelect={setCurrentTab}
            >
                <TabBar.Item className={cl("tab", { selected: currentTab === Tabs.ServerInfo })} id={Tabs.ServerInfo}>
                    Server Info
                </TabBar.Item>
                <TabBar.Item className={cl("tab", { selected: currentTab === Tabs.Friends })} id={Tabs.Friends} >
                    Friends{friendCount !== undefined ? ` (${friendCount})` : ""}
                </TabBar.Item>
                <TabBar.Item
                    className={cl("tab", { selected: currentTab === Tabs.BlockedUsers })}
                    id={Tabs.BlockedUsers}
                >
                    Blocked Users{blockedCount !== undefined ? ` (${blockedCount})` : ""}
                </TabBar.Item>
                <TabBar.Item
                    className={cl("tab", { selected: currentTab === Tabs.IgnoredUsers })}
                    id={Tabs.IgnoredUsers}
                >
                    Ignored Users{ignoredCount !== undefined ? ` (${ignoredCount})` : ""}
                </TabBar.Item>
            </TabBar>

            <div className={cl("tab-content")}>
                {currentTab === Tabs.ServerInfo && <ServerInfoTab guild={guild} />}
                {currentTab === Tabs.Friends && <FriendsTab guild={guild} setCount={setFriendCount} />}
                {currentTab === Tabs.BlockedUsers && <BlockedUsersTab guild={guild} setCount={setBlockedCount} />}
                {currentTab === Tabs.IgnoredUsers && <IgnoredUserTab guild={guild} setCount={setIgnoredCount} />}
            </div>
        </Modal>
    );
}

function Owner(guildId: string, owner: User) {
    const guildAvatar = GuildMemberStore.getMember(guildId, owner.id)?.avatar;
    const ownerAvatarUrl =
        guildAvatar
            ? IconUtils.getGuildMemberAvatarURLSimple({
                userId: owner!.id,
                avatar: guildAvatar,
                guildId,
                canAnimate: true
            })
            : IconUtils.getUserAvatarURL(owner, true);

    return (
        <div className={cl("owner")}>
            <img
                className={cl("owner-avatar")}
                src={ownerAvatarUrl}
                alt=""
                onClick={() => openImageModal({
                    url: ownerAvatarUrl,
                    height: 512,
                    width: 512
                })}
            />
            {Parser.parse(`<@${owner.id}>`)}
        </div>
    );
}

function ServerInfoTab({ guild }: GuildProps) {
    const [owner] = useAwaiter(() => UserUtils.getUser(guild.ownerId), {
        deps: [guild.ownerId],
        fallbackValue: null
    });

    const verificationLevel = ["None", "Low", "Medium", "High", "Highest"][guild.verificationLevel] ?? "?";
    const explicitFilter = ["Disabled", "No role", "Everyone"][guild.explicitContentFilter] ?? "?";
    const nsfwLevel = ["Default", "Explicit", "Safe", "Age Restricted"][guild.nsfwLevel] ?? "?";

    const Fields: Record<string, React.ReactNode> = {
        "Owner": owner ? Owner(guild.id, owner) : <Text variant="text-sm/normal">Loading...</Text>,
        "Created At": renderTimestamp(SnowflakeUtils.extractTimestamp(guild.id)),
        "Joined At": guild.joinedAt ? renderTimestamp(guild.joinedAt.getTime()) : <Text variant="text-sm/normal">-</Text>,
        "Max Members": <Text variant="text-sm/normal">{guild.maxMembers?.toLocaleString() ?? "?"}</Text>,
        "Channels": <Text variant="text-sm/normal">{GuildChannelStore.getChannels(guild.id)?.count - 1 || "?"}</Text>,
        "Roles": <Text variant="text-sm/normal">{GuildRoleStore.getSortedRoles(guild.id).length - 1}</Text>,
        "Boosts": <Text variant="text-sm/normal">{guild.premiumSubscriberCount ?? 0} (Level {guild.premiumTier ?? 0})</Text>,
        "Verification": <Text variant="text-sm/normal">{verificationLevel}</Text>,
        "Explicit Filter": <Text variant="text-sm/normal">{explicitFilter}</Text>,
        "NSFW Level": <Text variant="text-sm/normal">{nsfwLevel}</Text>,
        "Locale": <Text variant="text-sm/normal">{guild.preferredLocale || "-"}</Text>,
        "Vanity URL": guild.vanityURLCode
            ? <MaskedLink href={`https://discord.gg/${guild.vanityURLCode}`}>discord.gg/{guild.vanityURLCode}</MaskedLink>
            : <Text variant="text-sm/normal">-</Text>
    };

    const Features: Partial<Record<GuildFeatures, string>> = {
        VERIFIED: "Verified",
        PARTNERED: "Partnered",
        COMMUNITY: "Community",
        DISCOVERABLE: "Discoverable",
        FEATURABLE: "Featurable",
        CREATOR_MONETIZABLE_DISABLED: "Monetization",
        NEWS: "Announcement Channels",
        ANIMATED_ICON: "Animated Icon",
        ANIMATED_BANNER: "Animated Banner",
        INVITE_SPLASH: "Invite Splash",
        VIP_REGIONS: "VIP Voice Regions",
        WELCOME_SCREEN_ENABLED: "Welcome Screen",
        MEMBER_VERIFICATION_GATE_ENABLED: "Membership Gating",
        THREADS_ENABLED: "Private Threads",
        ROLE_ICONS: "Role Icons",
        AUTO_MODERATION: "AutoMod"
    };


    const features = [...guild.features].filter(f => f in Features);

    return (
        <div className={cl("info")}>
            {Object.entries(Fields).map(([name, node]) =>
                <div className={cl("server-info-pair")} key={name}>
                    <Forms.FormTitle tag="h6">{name}</Forms.FormTitle>
                    {node}
                </div>
            )}
            {features.length > 0 && (
                <div className={cl("server-info-pair")}>
                    <Forms.FormTitle tag="h5">Features</Forms.FormTitle>
                    <div className={cl("features-list")}>
                        {features.map(f => (
                            <Text key={f} className={cl("feature-badge")} color="text-muted" variant="text-xs/normal">
                                {Features[f]}
                            </Text>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function FriendsTab({ guild, setCount }: RelationshipProps) {
    return UserList("friends", guild, RelationshipStore.getFriendIDs(), setCount);
}

function BlockedUsersTab({ guild, setCount }: RelationshipProps) {
    return UserList("blocked", guild, RelationshipStore.getBlockedIDs(), setCount);
}

function IgnoredUserTab({ guild, setCount }: RelationshipProps) {
    return UserList("ignored", guild, RelationshipStore.getIgnoredIDs(), setCount);
}

function UserList(type: "friends" | "blocked" | "ignored", guild: Guild, ids: string[], setCount: (count: number) => void) {
    const missing = [] as string[];
    const members = [] as string[];

    for (const id of ids) {
        if (GuildMemberStore.isMember(guild.id, id))
            members.push(id);
        else
            missing.push(id);
    }

    useStateFromStores(
        [GuildMemberStore],
        () => GuildMemberStore.getMemberIds(guild.id),
        null,
        (old, curr) => old.length === curr.length
    );

    useEffect(() => {
        if (!fetched[type] && missing.length) {
            fetched[type] = true;
            FluxDispatcher.dispatch({
                type: "GUILD_MEMBERS_REQUEST",
                guildIds: [guild.id],
                userIds: missing
            });
        }
    }, []);

    useEffect(() => setCount(members.length), [members.length]);

    return (
        <ScrollerThin fade className={cl("scroller")}>
            {members.map(id =>
                <FriendRow
                    key={id}
                    user={UserStore.getUser(id)}
                    status={PresenceStore.getStatus(id) || "offline"}
                    onSelect={() => openUserProfile(id)}
                />
            )}
        </ScrollerThin>
    );
}
