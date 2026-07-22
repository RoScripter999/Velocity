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

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { classes } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import type { Guild } from "@velocity-types";
import { ChannelStore, Dialog, GuildMemberStore, GuildRoleStore, GuildStore, Icons, match, Menu, PermissionsBits, Popout, PopoutClasses, Tooltip, useRef, UserStore } from "@webpack/common";

import openRolesAndUsersPermissionsModal, { PermissionType, type RoleOrUserPermission } from "./components/RolesAndUsersPermissions";
import UserPermissions from "./components/UserPermissions";
import { getSortedRolesForMember, sortPermissionOverwrites } from "./utils";

export const enum PermissionsSortOrder {
    HighestRole,
    LowestRole
}

const enum MenuItemParentType {
    User,
    Channel,
    Guild
}

export const settings = definePluginSettings({
    permissionsSortOrder: {
        description: "The sort method used for defining which role grants an user a certain permission",
        type: OptionType.SELECT,
        options: [
            { label: "Highest Role", value: PermissionsSortOrder.HighestRole, default: true },
            { label: "Lowest Role", value: PermissionsSortOrder.LowestRole }
        ]
    },
    hideNeutral: {
        description: "Hides the Neutral permissions in the modal",
        type: OptionType.BOOLEAN,
        default: false
    }
});

function MenuItem(guildId: string, id?: string, type?: MenuItemParentType, showIcon = false) {
    if (type === MenuItemParentType.User && !GuildMemberStore.isMember(guildId, id!)) return null;

    return (
        <Menu.MenuItem
            id="perm-viewer-permissions"
            label="Permissions"
            leadingAccessory={showIcon ? { type: "icon", icon: Icons.ShieldIcon } : undefined}
            icon={showIcon ? Icons.ShieldIcon : undefined}
            action={() => {
                const guild = GuildStore.getGuild(guildId);

                const { permissions, header, userId } = match(type)
                    .returnType<{ permissions: RoleOrUserPermission[], header: string; userId?: string; }>()
                    .with(MenuItemParentType.User, () => {
                        const member = GuildMemberStore.getMember(guildId, id!)!;

                        const permissions: RoleOrUserPermission[] = getSortedRolesForMember(guild, member)
                            .map(role => ({
                                type: PermissionType.Role,
                                ...role
                            }));

                        if (guild.ownerId === id) {
                            permissions.push({
                                type: PermissionType.Owner,
                                permissions: Object.values(PermissionsBits).reduce((prev, curr) => prev | curr, 0n)
                            });
                        }

                        return {
                            permissions,
                            header: member.nick ?? UserStore.getUser(member.userId).username,
                            userId: id
                        };
                    })
                    .with(MenuItemParentType.Channel, () => {
                        const channel = ChannelStore.getChannel(id!);

                        const permissions = sortPermissionOverwrites(Object.values(channel.permissionOverwrites).map(({ id, allow, deny, type }) => ({
                            type: type as any,
                            id,
                            overwriteAllow: allow,
                            overwriteDeny: deny
                        })), guildId);

                        return {
                            permissions,
                            header: channel.name,
                            userId: undefined
                        };
                    })
                    .otherwise(() => {
                        const permissions = GuildRoleStore.getSortedRoles(guild.id).map(role => ({
                            type: PermissionType.Role,
                            ...role
                        }));

                        return {
                            permissions,
                            header: guild.name,
                            userId: undefined
                        };
                    });

                openRolesAndUsersPermissionsModal(permissions, guild, header, userId);
            }}
        />
    );
}

function makeContextMenuPatch(childId: string | string[], type?: MenuItemParentType, showIcon = false): NavContextMenuPatchCallback {
    return (children, props) => {
        if (
            !props ||
            (type === MenuItemParentType.User && !props.user) ||
            (type === MenuItemParentType.Guild && !props.guild) ||
            (type === MenuItemParentType.Channel && (!props.channel || !props.guild))
        ) {
            return;
        }

        const group = findGroupChildrenByChildId(childId, children);

        const item = match(type)
            .with(MenuItemParentType.User, () => MenuItem(props.guildId, props.user.id, type, showIcon))
            .with(MenuItemParentType.Channel, () => MenuItem(props.guild.id, props.channel.id, type, showIcon))
            .with(MenuItemParentType.Guild, () => MenuItem(props.guild.id, undefined, undefined, showIcon))
            .otherwise(() => null);


        if (item == null) return;

        if (group) {
            return group.push(item);
        }

        // "roles" may not be present due to the member not having any roles. In that case, add it above "Copy ID"
        if (childId === "roles" && props.guildId) {
            children.splice(-1, 0, <Menu.MenuGroup>{item}</Menu.MenuGroup>);
        }
    };
}

export default definePlugin({
    name: "PermissionsViewer",
    description: "View the permissions a user or channel has, and the roles of a server",
    tags: ["Servers", "Roles", "Utility"],
    dependencies: ["BetterRoleContext"],
    authors: [Devs.Nuckyz, Devs.Ven],
    settings,

    patches: [
        {
            find: "#{intl::COLLAPSE_ROLES}",
            replacement: {
                match: /(?<=\i\.id\)\),\i\(\))(?=,\i\?)/,
                replace: ",$self.ViewPermissionsButton(arguments[0])"
            }
        }
    ],

    ViewPermissionsButton: ErrorBoundary.wrap(({ className, guild, userId }: { className: string; guild: Guild; userId: string; }) => {
        const guildMember = GuildMemberStore.getMember(guild.id, userId);
        if (!guildMember) return null;

        const buttonRef = useRef(null);

        return (
            <Popout
                position="bottom"
                align="center"
                targetElementRef={buttonRef}
                renderPopout={({ closePopout }) => (
                    <Dialog className={PopoutClasses.container} style={{ width: "500px" }}>
                        <UserPermissions guild={guild} guildMember={guildMember} closePopout={closePopout} />
                    </Dialog>
                )}
            >
                {popoutProps => (
                    <Tooltip text="View Permissions" position="top">
                        {tooltipProps => (
                            <button
                                {...popoutProps}
                                {...tooltipProps}
                                ref={buttonRef}
                                className={classes(className, "vc-permviewer-role-button")}
                                onClick={e => popoutProps.onClick(e)}
                            >
                                <Icons.ShieldIcon color="currentColor" size="xs" />
                            </button>
                        )}
                    </Tooltip>
                )}
            </Popout>
        );
    }, { noop: true }),

    contextMenus: {
        "user-context": makeContextMenuPatch("roles", MenuItemParentType.User),
        "channel-context": makeContextMenuPatch(["mute-channel", "unmute-channel"], MenuItemParentType.Channel),
        "guild-context": makeContextMenuPatch("privacy", MenuItemParentType.Guild),
        "guild-header-popout": makeContextMenuPatch("privacy", MenuItemParentType.Guild, true)
    }
});
