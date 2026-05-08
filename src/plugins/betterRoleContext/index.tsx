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

import { definePluginSettings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { ImageIcon } from "@components/Icons";
import { copyToClipboard } from "@utils/clipboard";
import { Devs } from "@utils/constants";
import { getCurrentChannel, getCurrentGuild, openImageModal } from "@utils/discord";
import { isTruthy } from "@utils/guards";
import { classes } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import type { Guild, PopoutProps, Role } from "@velocity-types";
import { findByCodeLazy, findByPropsLazy } from "@webpack";
import { CMIconClasses, GuildRoleStore, Icons, Menu, PermissionStore, Popout, useRef } from "@webpack/common";
import type { ComponentType, RefObject } from "react";

const GuildSettingsActions = findByPropsLazy("open", "selectRole", "updateGuild");

const loadRoleMembers = findByCodeLazy(".GUILD_ROLE_MEMBER_IDS(", "requestMembersById");

const DeveloperMode = getUserSettingLazy("appearance", "developerMode")!;

const settings = definePluginSettings({
    roleIconFileFormat: {
        type: OptionType.SELECT,
        description: "File format to use when viewing role icons",
        options: [
            {
                label: "png",
                value: "png",
                default: true
            },
            {
                label: "webp",
                value: "webp"
            },
            {
                label: "jpg",
                value: "jpg"
            }
        ]
    }
});

interface RoleMemberPopoutProps {
    popoutProps: PopoutProps;
    guildId: string;
    channelId: string;
    roleId: string;
}
type RoleMemberPopout = ComponentType<RoleMemberPopoutProps>;

let RoleMemberPopout: RoleMemberPopout = () => null;

export function buildExtraRoleContextMenuItems(role: Role, guild: Guild, popoutRef?: RefObject<any>) {
    if (!role) return { before: [], after: [] };

    const before = [
        PermissionStore.getGuildPermissionProps(guild).canManageRoles && (
            <Menu.MenuItem
                key="vc-edit-role"
                id="vc-edit-role"
                label="Edit Role"
                action={async () => {
                    await GuildSettingsActions.open(guild.id, "ROLES");
                    GuildSettingsActions.selectRole(role.id);
                }}
                icon={Icons.PencilIcon}
            />
        ),
        role.colorString && (
            <Menu.MenuItem
                key="vc-copy-role-color"
                id="vc-copy-role-color"
                label="Copy Role Color"
                action={() => copyToClipboard(role.colorString!)}
                icon={Icons.PaintPaletteIcon}
            />
        )
    ].filter(isTruthy);

    const after = [
        role.icon && (
            <Menu.MenuItem
                id="vc-view-role-icon"
                label="View Role Icon"
                action={() => {
                    openImageModal({
                        url: `${location.protocol}//${window.GLOBAL_ENV.CDN_HOST}/role-icons/${role.id}/${role.icon}.${settings.store.roleIconFileFormat}`,
                        height: 128,
                        width: 128
                    });
                }}
                icon={ImageIcon}
            />
        ),
        popoutRef && (
            <Menu.MenuItem
                key="vc-view-role-members"
                id="vc-view-role-members"
                label="View Role Members"
                render={() => (
                    <Popout
                        position="right"
                        align="center"
                        targetElementRef={popoutRef}
                        preload={() => loadRoleMembers(guild.id, role.id)}
                        renderPopout={popoutProps => (
                            <RoleMemberPopout
                                popoutProps={popoutProps}
                                guildId={guild.id}
                                channelId={getCurrentChannel()!.id}
                                roleId={role.id}
                            />
                        )}
                    >
                        {popoutProps => (
                            <div
                                className={classes(CMIconClasses.item, CMIconClasses.labelContainer, CMIconClasses.colorDefault)}
                                ref={popoutRef}
                                role="menuitem"
                                {...popoutProps}
                            >
                                <div className={CMIconClasses.label}>View Role Members</div>
                                <Icons.UserIcon className={CMIconClasses.iconContainer} />
                            </div>
                        )}
                    </Popout>
                )}
            />
        )
    ].filter(isTruthy);

    return { before, after };
}


export default definePlugin({
    name: "BetterRoleContext",
    description: "Adds options to copy role color / edit role / view role icon when right clicking roles in the user profile",
    tags: ["Roles", "Appearance"],
    authors: [Devs.Ven, Devs.goodbee],
    dependencies: ["UserSettingsAPI"],

    settings,

    patches: [{
        find: ".ROLE_MENTION)",
        replacement: {
            match: /function (\i)(?=.+?renderPopout:.{0,20}\1,\{guildId:\i,channelId:\i)/,
            replace: "$self.RoleMembers=$1;$&"
        }
    }],

    start() {
        // DeveloperMode needs to be enabled for the context menu to be shown
        DeveloperMode.updateSetting(true);
    },

    set RoleMembers(component: RoleMemberPopout) {
        RoleMemberPopout = component;
    },

    contextMenus: {
        "dev-context"(children, { id }: { id: string; }) {
            const popoutRef = useRef(null);

            const guild = getCurrentGuild();
            if (!guild) return;

            const role = GuildRoleStore.getRole(guild.id, id);
            if (!role) return;

            const { before, after } = buildExtraRoleContextMenuItems(role, guild, popoutRef);
            children.unshift(...before);
            children.push(...after);
        }
    }
});
