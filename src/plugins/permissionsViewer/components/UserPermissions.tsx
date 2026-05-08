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

import ErrorBoundary from "@components/ErrorBoundary";
import { HeadingTertiary } from "@components/Heading";
import { getIntlMessage } from "@utils/discord";
import { classes } from "@utils/misc";
import type { Guild, GuildMember } from "@velocity-types";
import { findCssClassesLazy } from "@webpack";
import { Icons, PermissionsBits, Text, Tooltip, useMemo, UserStore } from "@webpack/common";

import { PermissionsSortOrder, settings } from "..";
import { cl, getGuildPermissionSpecMap, getSortedRolesForMember, sortUserRoles } from "../utils";
import openRolesAndUsersPermissionsModal, { PermissionType, type RoleOrUserPermission } from "./RolesAndUsersPermissions";

interface UserPermission {
    permission: string;
    roleName: string;
    roleColor: string;
    rolePosition: number;
}

type UserPermissions = Array<UserPermission>;

const RoleClasses = findCssClassesLazy("role", "roleName", "roleRemoveButton", "roleNameOverflow", "root");
const RoleBorderClasses = findCssClassesLazy("roleCircle", "dot", "dotBorderColor");

interface FakeRoleProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string;
    color: string;
}

function FakeRole({ text, color, ...props }: FakeRoleProps) {
    return (
        <div {...props} className={classes(RoleClasses.role)}>
            <div className={RoleClasses.roleRemoveButton}>
                <span
                    className={RoleBorderClasses.roleCircle}
                    style={{ backgroundColor: color }}
                />
            </div>
            <div className={RoleClasses.roleName}>
                <Text
                    className={RoleClasses.roleNameOverflow}
                    variant="text-xs/medium"
                >
                    {text}
                </Text>
            </div>
        </div>
    );
}

interface GrantedByTooltipProps {
    roleName: string;
    roleColor: string;
}

function GrantedByTooltip({ roleName, roleColor }: GrantedByTooltipProps) {
    return (
        <>
            <Text variant="text-sm/medium">Granted By</Text>
            <FakeRole text={roleName} color={roleColor} />
        </>
    );
}

function UserPermissionsComponent({ guild, guildMember, closePopout }: { guild: Guild; guildMember: GuildMember; closePopout: () => void; }) {
    const { permissionsSortOrder } = settings.use(["permissionsSortOrder"]);

    const guildPermissionSpecMap = useMemo(() => getGuildPermissionSpecMap(guild), [guild.id]);

    const [rolePermissions, userPermissions] = useMemo(() => {
        const userPermissions: UserPermissions = [];

        const userRoles = getSortedRolesForMember(guild, guildMember);

        const rolePermissions: Array<RoleOrUserPermission> = userRoles.map(role => ({
            type: PermissionType.Role,
            ...role
        }));

        if (guild.ownerId === guildMember.userId) {
            rolePermissions.push({
                type: PermissionType.Owner,
                permissions: Object.values(PermissionsBits).reduce((prev, curr) => prev | curr, 0n)
            });

            const OWNER = getIntlMessage("GUILD_OWNER") ?? "Server Owner";
            userPermissions.push({
                permission: OWNER,
                roleName: "Owner",
                roleColor: "var(--primary-300)",
                rolePosition: Infinity
            });
        }

        sortUserRoles(userRoles);

        for (const bit of Object.values(PermissionsBits)) {
            for (const { permissions, colorString, position, name } of userRoles) {
                if ((permissions & bit) === bit) {
                    userPermissions.push({
                        permission: guildPermissionSpecMap[String(bit)].title,
                        roleName: name,
                        roleColor: colorString || "var(--primary-300)",
                        rolePosition: position
                    });

                    break;
                }
            }
        }

        userPermissions.sort((a, b) => b.rolePosition - a.rolePosition);

        return [rolePermissions, userPermissions];
    }, [permissionsSortOrder]);

    return <div>
        <div className={cl("user-header-container")}>
            <HeadingTertiary>Permissions</HeadingTertiary>
            <div className={cl("user-header-btns")}>
                <Tooltip text={`Sorting by ${permissionsSortOrder === PermissionsSortOrder.HighestRole ? "Highest Role" : "Lowest Role"}`}>
                    {tooltipProps => (
                        <div
                            {...tooltipProps}
                            className={cl("user-header-btn")}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                settings.store.permissionsSortOrder = permissionsSortOrder === PermissionsSortOrder.HighestRole ? PermissionsSortOrder.LowestRole : PermissionsSortOrder.HighestRole;
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 96 960 960"
                                transform={permissionsSortOrder === PermissionsSortOrder.HighestRole ? "scale(1 1)" : "scale(1 -1)"}
                            >
                                <path fill="var(--text-default)" d="M440 896V409L216 633l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
                            </svg>
                        </div>
                    )}
                </Tooltip>
                <Tooltip text="Role Details">
                    {tooltipProps => (
                        <div
                            {...tooltipProps}
                            className={cl("user-header-btn")}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                closePopout();
                                openRolesAndUsersPermissionsModal(rolePermissions, guild, guildMember.nick || UserStore.getUser(guildMember.userId).username, guildMember.userId);
                            }}
                        >
                            <Icons.MoreHorizontalIcon />
                        </div>
                    )}
                </Tooltip>
            </div>
        </div>
        {userPermissions.length > 0 && (
            <div className={classes(RoleClasses.root)}>
                {userPermissions.map(({ permission, roleColor, roleName }) => (
                    <Tooltip
                        key={permission}
                        text={<GrantedByTooltip roleName={roleName} roleColor={roleColor} />}
                        tooltipClassName={cl("granted-by-container")}
                        tooltipContentClassName={cl("granted-by-content")}
                    >
                        {tooltipProps => (
                            <FakeRole {...tooltipProps} text={permission} color={roleColor} />
                        )}
                    </Tooltip>
                ))}
            </div>
        )}
    </div>;
}

export default ErrorBoundary.wrap(UserPermissionsComponent, { noop: true });
