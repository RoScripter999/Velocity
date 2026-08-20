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

import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { SectionHeader } from "@components/settings";
import { buildExtraRoleContextMenuItems } from "@plugins/betterRoleContext";
import { getIntlMessage, getUniqueUsername } from "@utils/discord";
import { copyToClipboard } from "@utils/misc";
import type { DiscordLocale, Guild, ModalPropsRender, Role, UnicodeEmoji, User } from "@velocity-types";
import { findByCodeLazy } from "@webpack";
import { Buttons, ContextMenuApi, FluxDispatcher, GuildMemberStore, GuildRoleStore, Icons, IconUtils, Menu, Modal, openModal, RichTooltip, ScrollerThin, SearchBar, Text, useEffect, useMemo, useRef, UserStore, useState, useStateFromStores } from "@webpack/common";

import { settings } from "..";
import { cl, generateGuildPermissionSpec, getGuildPermissionSpecMap } from "../utils";

export const enum PermissionType {
    Role = 0,
    User = 1,
    Owner = 2
}

export interface RoleOrUserPermission {
    type: PermissionType;
    id?: string;
    permissions?: bigint;
    overwriteAllow?: bigint;
    overwriteDeny?: bigint;
}

interface GeneratedGuildPermissionsMap extends Array<{
    title: string; // Category title (e.g. "General Server Permissions")
    permissions: Array<{
        title: string; // Permission title (e.g. "View Channels")
        flag: bigint;
        readonly description: Array<{
            locale: DiscordLocale; // idk why i included this lol
            ast: Array<string>;
        }>;
    }>;
}> { }

type GetRoleIconData = (role: Role, size: number) => { customIconSrc?: string; unicodeEmoji?: UnicodeEmoji; };
const getRoleIconData: GetRoleIconData = findByCodeLazy("convertSurrogateToName", "customIconSrc", "unicodeEmoji");

function getRoleIconSrc(role: Role) {
    const icon = getRoleIconData(role, 20);
    if (!icon) return;

    const { customIconSrc, unicodeEmoji } = icon;
    return customIconSrc ?? unicodeEmoji?.url;
}

function RolesAndUsersPermissionsComponent({ permissions, guild, modalProps, header, userId }: { permissions: Array<RoleOrUserPermission>; guild: Guild; modalProps: ModalPropsRender; header: string; userId?: string; }) {
    const guildPermissionSpecMap = useMemo(() => getGuildPermissionSpecMap(guild), [guild.id]);
    const guildPermissionsSpecMap = useMemo(() => generateGuildPermissionSpec(guild), [guild.id]) as GeneratedGuildPermissionsMap;

    useStateFromStores(
        [GuildMemberStore],
        () => GuildMemberStore.getMemberIds(guild.id),
        null,
        (old, current) => old.length === current.length
    );

    useEffect(() => {
        permissions.sort((a, b) => a.type - b.type);
    }, [permissions]);

    useEffect(() => {
        const usersToRequest = permissions
            .filter(p => p.type === PermissionType.User && !GuildMemberStore.isMember(guild.id, p.id!))
            .map(({ id }) => id);

        FluxDispatcher.dispatch({
            type: "GUILD_MEMBERS_REQUEST",
            guildIds: [guild.id],
            userIds: usersToRequest
        });
    }, []);

    const roles = GuildRoleStore.getRolesSnapshot(guild.id);

    const groupedPermissions = useMemo(() => {
        const groups = new Map<string, RoleOrUserPermission[]>();
        const flat: RoleOrUserPermission[] = [];

        for (const permission of permissions) {
            let placed = false;

            for (const section of guildPermissionsSpecMap) {
                const matches = section.permissions.some(p => {
                    if (!permission.permissions) return false;
                    return (permission.permissions & p.flag) === p.flag;
                });

                if (matches) {
                    if (!groups.has(section.title)) groups.set(section.title, []);
                    groups.get(section.title)!.push(permission);
                    flat.push(permission);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                if (!groups.has("Other")) groups.set("Other", []);
                groups.get("Other")!.push(permission);
                flat.push(permission);
            }
        }

        return { groups, flat };
    }, [permissions, guildPermissionsSpecMap]);

    const groupedBits = useMemo(() => {
        const groups = new Map<string, bigint[]>();
        for (const section of guildPermissionsSpecMap) {
            groups.set(section.title, section.permissions.map(p => p.flag));
        }
        return groups;
    }, [guildPermissionsSpecMap]);

    const headerIcon = useMemo(() => {
        if (userId) {
            const user = UserStore.getUser(userId);
            if (user) return user.getAvatarURL(void 0, 80, false);
        }
        return IconUtils.getGuildIconURL({ id: guild.id, icon: guild.icon });
    }, [userId, guild.id, guild.icon]);

    const [selectedItemIndex, selectItem] = useState(0);
    const selectedItem = groupedPermissions.flat[selectedItemIndex];

    const [permissionSearch, setPermissionSearch] = useState("");
    const [roleSearch, setRoleSearch] = useState("");
    const [hideNeutral, setHideNeutral] = useState(settings.use(["hideNeutral"]).hideNeutral);

    function getPermissionName(p: RoleOrUserPermission): string {
        if (p.type === PermissionType.Owner) return "Server Owner";
        if (p.type === PermissionType.Role) return roles[p.id ?? ""]?.name ?? "Unknown Role";
        const user = UserStore.getUser(p.id ?? "");
        return (user && getUniqueUsername(user)) ?? "Unknown User";
    }

    function getPermissionState(bit: bigint): "allow" | "deny" | "inherit" {
        const { permissions, overwriteAllow, overwriteDeny } = selectedItem;
        if (permissions) return (permissions & bit) === bit ? "allow" : "deny";
        if (overwriteAllow && (overwriteAllow & bit) === bit) return "allow";
        if (overwriteDeny && (overwriteDeny & bit) === bit) return "deny";
        return "inherit";
    }

    function resolveDescription(raw: any): string {
        if (!raw) return "";

        const extractText = (part: any): string => {
            if (typeof part === "string") return part;
            if (part?.props?.children) {
                const c = part.props.children;
                return Array.isArray(c) ? c.map(extractText).join("") : extractText(c);
            }
            return "";
        };

        const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.ast) ? raw.ast : null;
        if (arr) return arr.map(extractText).join("");
        return String(raw);
    }

    const SearchNotFound = () => (
        <Flex alignItems="flex-start" justifyContent="flex-start" flexDirection="column">
            <Text variant="text-md/semibold">No search results found</Text>
            <Text color="text-subtle">We tried, but came up empty.</Text>
        </Flex>
    );

    const filteredRoleGroups = useMemo(() => {
        const query = roleSearch.trim().toLowerCase();
        if (!query) return groupedPermissions.groups;

        const result = new Map<string, RoleOrUserPermission[]>();
        for (const [category, items] of groupedPermissions.groups) {
            const filtered = items.filter(p => getPermissionName(p).toLowerCase().includes(query));
            if (filtered.length) result.set(category, filtered);
        }
        return result;
    }, [roleSearch, groupedPermissions.groups, roles]);

    const filteredPermissionCategories = useMemo(() => {
        const query = permissionSearch.trim().toLowerCase();

        return Array.from(groupedBits.entries()).flatMap(([category, bits]) => {
            const filteredBits = bits.filter(bit => {
                const spec = guildPermissionSpecMap[String(bit)];
                if (!spec) return false;
                if (query && !spec.title.toLowerCase().includes(query)) return false;
                if (hideNeutral && getPermissionState(bit) === "inherit") return false;
                return true;
            });

            return filteredBits.length ? [{ category, filteredBits }] : [];
        });
    }, [permissionSearch, hideNeutral, selectedItem, groupedBits, guildPermissionSpecMap]);

    return (
        <Modal
            {...modalProps}
            size="xl"
            title={<SectionHeader
                title={header}
                titleVariant="text-lg/semibold"
                description="View effective permissions and roles breakdowns"
                descriptionVariant="text-xs/normal"
                descriptionColor="text-subtle"
                layout="horizontal"
                icon={() => (
                    <img
                        src={headerIcon}
                        style={{ width: 46, height: 46, borderRadius: "50%", userSelect: "none", cursor: userId ? "pointer" : "default" }}
                        onContextMenu={userId ? e => {
                            ContextMenuApi.openContextMenu(e, () => <UserContextMenu userId={userId} />);
                        } : undefined}
                    />
                )}
            />}
        >

            <div className={cl("modal-content")}>
                {!selectedItem ? (
                    <div className={cl("modal-no-perms")}>
                        <Text variant="heading-lg/normal">No permissions to display!</Text>
                    </div>
                ) : (
                    <div className={cl("modal-container")}>

                        <div className={cl("modal-left")}>
                            <div style={{ flexShrink: 0 }}>
                                <SearchBar
                                    placeholder="Search roles..."
                                    query={roleSearch}
                                    onClear={() => setRoleSearch("")}
                                    onChange={setRoleSearch}
                                />
                            </div>

                            <ScrollerThin className={cl("modal-list")} orientation="auto" style={{ flex: 1, minHeight: 0, overflow: "hidden auto" }}>
                                {filteredRoleGroups.size === 0 ? <SearchNotFound /> : (
                                    Array.from(filteredRoleGroups.entries()).map(([category, items]) => (
                                        <div key={category}>
                                            <Text variant="text-xs/semibold" className={cl("modal-category-title")} color="text-muted">
                                                {category}
                                            </Text>

                                            {items.map(permission => {
                                                const index = groupedPermissions.flat.indexOf(permission);
                                                const user: User | undefined = UserStore.getUser(permission.id ?? "");
                                                const role: Role | undefined = roles[permission.id ?? ""];
                                                const roleIconSrc = role ? getRoleIconSrc(role) : undefined;

                                                return (
                                                    <div
                                                        key={permission.id ?? index}
                                                        className={cl("modal-list-item-btn")}
                                                        onClick={() => selectItem(index)}
                                                        onContextMenu={e => {
                                                            if (permission.type === PermissionType.User && permission.id) {
                                                                ContextMenuApi.openContextMenu(e, () => (
                                                                    <UserContextMenu userId={permission.id!} />
                                                                ));
                                                            } else if (permission.type === PermissionType.Role && permission.id) {
                                                                ContextMenuApi.openContextMenu(e, () => (
                                                                    <RoleContextMenu guild={guild} roleId={permission.id!} onClose={modalProps.onClose} />
                                                                ));
                                                            }
                                                        }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <div className={cl("modal-list-item", { "modal-list-item-active": selectedItemIndex === index })}>
                                                            {(permission.type === PermissionType.Role || permission.type === PermissionType.Owner) && (
                                                                <span
                                                                    className={cl("modal-role-circle")}
                                                                    style={{ backgroundColor: role?.colorString ?? "var(--primary-300)" }}
                                                                />
                                                            )}
                                                            {permission.type === PermissionType.Role && roleIconSrc && (
                                                                <img className={cl("modal-role-image")} src={roleIconSrc} />
                                                            )}
                                                            {permission.type === PermissionType.User && user && (
                                                                <img className={cl("modal-user-img")} src={user.getAvatarURL(void 0, void 0, false)} />
                                                            )}
                                                            <Text variant="text-md/normal" className={cl("modal-list-item-text")}>
                                                                {getPermissionName(permission)}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </ScrollerThin>
                        </div>

                        <div className={cl("modal-divider")} />

                        <div className={cl("modal-right")}>
                            <div className={cl("modal-perms-filters")}>
                                <SearchBar
                                    query={permissionSearch}
                                    onChange={setPermissionSearch}
                                    onClear={() => setPermissionSearch("")}
                                    placeholder="Search permissions..."
                                />
                                <RichTooltip body={`${hideNeutral ? "Show" : "Hide"} neutral permissions`}>
                                    <Buttons.IconButton variant="secondary" icon={() => hideNeutral ? <Icons.EyeSlashIcon color="currentColor" /> : <Icons.EyeIcon color="currentColor" />} onClick={() => setHideNeutral(v => {
                                        const next = !v;
                                        settings.store.hideNeutral = next;
                                        return next;
                                    })} />
                                </RichTooltip>
                            </div>

                            <ScrollerThin className={cl("modal-perms")} orientation="auto">
                                {filteredPermissionCategories.length === 0 ? <SearchNotFound /> : (
                                    filteredPermissionCategories.map(({ category, filteredBits }) => (
                                        <div key={category} className={cl("modal-perm-category")}>
                                            <div className={cl("modal-category-title")}>
                                                <Text variant="text-md/semibold" color="text-muted" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>{category}</Text>
                                            </div>

                                            {filteredBits.map(bit => {
                                                const spec = guildPermissionSpecMap[String(bit)];
                                                const state = getPermissionState(bit);

                                                return (
                                                    <div key={bit} className={cl("modal-perms-item")}>
                                                        <div className={cl("modal-perms-item-icon")}>
                                                            {state === "allow"
                                                                ? <Icons.CheckmarkLargeIcon color="var(--status-positive)" />
                                                                : state === "deny"
                                                                    ? <Icons.XLargeIcon color="var(--status-danger)" />
                                                                    : <Icons.SlashIcon />}
                                                        </div>
                                                        <SectionHeader
                                                            title={spec.title}
                                                            description={resolveDescription(
                                                                typeof spec.description === "function"
                                                                    ? spec.description()
                                                                    : spec.description
                                                            )}
                                                            titleVariant="text-md/semibold"
                                                            descriptionVariant="text-xs/normal"
                                                            descriptionColor="text-subtle"
                                                            style={{ flex: 1 }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </ScrollerThin>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

function RoleContextMenu({ guild, roleId, onClose }: { guild: Guild; roleId: string; onClose: () => void; }) {
    const popoutRef = useRef(null);
    const role = GuildRoleStore.getRole(guild.id, roleId);
    const { before, after } = buildExtraRoleContextMenuItems(role!, guild, popoutRef);

    return (
        <Menu.Menu
            navId={cl("role-context-menu")}
            onClose={ContextMenuApi.closeContextMenu}
            aria-label="Role Options"
        >
            {before}
            <Menu.MenuItem
                id={cl("copy-role-id")}
                label={getIntlMessage("COPY_ID_ROLE")}
                icon={Icons.IdIcon}
                leadingAccessory={{ type: "icon", icon: Icons.IdIcon }}
                action={() => copyToClipboard(roleId)}
            />

            {after}

            <Menu.MenuItem
                id={cl("view-as-role")}
                label={getIntlMessage("VIEW_AS_ROLE")}
                icon={Icons.ArrowLargeRightIcon}
                leadingAccessory={{ type: "icon", icon: Icons.ArrowLargeRightIcon }}
                action={() => {
                    onClose();
                    FluxDispatcher.dispatch({
                        type: "IMPERSONATE_UPDATE",
                        guildId: guild.id,
                        data: {
                            type: "ROLES",
                            roles: {
                                [roleId]: role
                            }
                        }
                    });
                }}
            />
        </Menu.Menu>
    );
}

function UserContextMenu({ userId }: { userId: string; }) {
    return (
        <Menu.Menu
            navId={cl("user-context")}
            onClose={ContextMenuApi.closeContextMenu}
            aria-label="User Options"
        >
            <Menu.MenuItem
                id={cl("copy-user-id")}
                label={getIntlMessage("COPY_ID_USER")}
                icon={Icons.IdIcon}
                leadingAccessory={{ type: "icon", icon: Icons.IdIcon }}
                action={() => {
                    copyToClipboard(userId);
                }}
            />
        </Menu.Menu>
    );
}

const RolesAndUsersPermissions = ErrorBoundary.wrap(RolesAndUsersPermissionsComponent);

export default function openRolesAndUsersPermissionsModal(permissions: Array<RoleOrUserPermission>, guild: Guild, header: string, userId?: string) {
    return openModal(modalProps => (
        <RolesAndUsersPermissions
            modalProps={modalProps}
            permissions={permissions}
            guild={guild}
            header={header}
            userId={userId}
        />
    ));
}
