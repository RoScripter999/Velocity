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

import { definePluginSettings, Settings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { ImageIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { getCurrentChannel, getCurrentGuild, getIntlMessage, openImageModal } from "@utils/discord";
import { isTruthy } from "@utils/guards";
import { classes, copyToClipboard } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import type { Guild, Role } from "@velocity-types";
import { findByCodeLazy, findByPropsLazy, findCssClassesLazy } from "@webpack";
import { ContextMenuApi, GuildRoleStore, Icons, Menu, PermissionStore, Popout, RoleMemberPopout, useRef } from "@webpack/common";

const GuildSettingsActionCreators = findByPropsLazy("open", "selectRole", "updateGuild");

const Classes = findCssClassesLazy("item", "iconContainer", "iconContainerLeft", "labelContainer", "label", "icon", "colorDefault");
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

export function buildExtraRoleContextMenuItems(role: Role, guild: Guild, popoutRef?: React.RefObject<any>) {
    if (!role) return { before: [], after: [] };

    const before = [
        PermissionStore.getGuildPermissionProps(guild).canManageRoles && (
            <Menu.MenuItem
                key="vc-edit-role"
                id="vc-edit-role"
                label="Edit Role"
                action={async () => {
                    await GuildSettingsActionCreators.open(guild.id, "ROLES");
                    GuildSettingsActionCreators.selectRole(role.id);
                }}
                icon={Icons.PencilIcon}
                leadingAccessory={{ type: "icon", icon: Icons.PencilIcon }}

            />
        ),
        role.colorString && (
            <Menu.MenuItem
                key="vc-copy-role-color"
                id="vc-copy-role-color"
                label="Copy Role Color"
                action={() => copyToClipboard(role.colorString!)}
                icon={Icons.PaintPaletteIcon}
                leadingAccessory={{ type: "icon", icon: Icons.PaintPaletteIcon }}
            />
        )
    ].filter(isTruthy);

    const after = [
        role.icon && (
            <Menu.MenuItem
                key="vc-view-role-icon"
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
                leadingAccessory={{ type: "icon", icon: ImageIcon }}
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
                                className={classes(Classes.item, Classes.labelContainer, Classes.colorDefault)}
                                ref={popoutRef}
                                role="menuitem"
                                {...popoutProps}
                            >
                                {Settings.velocityStyles.manaContextMenu && <div className={Classes.iconContainerLeft}><Icons.UserIcon className={Classes.icon} /></div>}
                                <div className={Classes.label}>View Role Members</div>
                                {!Settings.velocityStyles.manaContextMenu && <div className={Classes.iconContainer}><Icons.UserIcon className={Classes.icon} /></div>}
                            </div>
                        )}
                    </Popout>
                )}
            />
        )
    ].filter(isTruthy);

    return { before, after };
}

export function openRoleContextMenu(event: React.MouseEvent<HTMLElement>, { guildId, id: roleId }: { guildId: string; id: string; }) {
    const guild = getCurrentGuild();
    if (!guild || guild.id !== guildId) return;

    const role = GuildRoleStore.getRole(guildId, roleId);
    if (!role) return;

    ContextMenuApi.openContextMenu(event, () => {
        const popoutRef = useRef(null);
        const { before, after } = buildExtraRoleContextMenuItems(role, guild, popoutRef);

        return (
            <Menu.Menu
                navId="vc-better-role-context-member-list"
                onClose={ContextMenuApi.closeContextMenu}
                aria-label="Role Actions"
            >
                {before}
                {after}
                <Menu.MenuItem
                    key="vc-better-role-context-copy-role-id"
                    id="vc-better-role-context-copy-role-id"
                    label={getIntlMessage("COPY_ID_ROLE")}
                    icon={Icons.IdIcon}
                    action={() => copyToClipboard(role.id)}
                />
            </Menu.Menu>
        );
    });
}

export default definePlugin({
    name: "BetterRoleContext",
    description: "Adds options to copy role color / edit role / view role icon when right clicking roles in the user profile or in the member list",
    tags: ["Roles", "Appearance"],
    authors: [Devs.Ven, Devs.goodbee],
    dependencies: ["UserSettingsAPI"],

    settings,

    openRoleContextMenu,
    patches: [
        // Conflicts with RoleColorEverywhere which changes the code at the end of our match. (and also uses same find & similar match)
        // However, BetterRoleContext applies first (alphabetic order), so it's not an issue
        {
            find: 'tutorialId:"whos-online',
            replacement: {
                match: /(?<=#{intl::CHANNEL_MEMBERS_A11Y_LABEL}.{0,200}?"aria-hidden":!0,)children:.{0,200}?(?:—|\\u2014) ",\i\]\}\)\]/,
                replace: "onContextMenu:e=>$self.openRoleContextMenu(e,arguments[0]),$&"
            }
        }
    ],

    start() {
        // DeveloperMode needs to be enabled for the context menu to be shown
        DeveloperMode.updateSetting(true);
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
