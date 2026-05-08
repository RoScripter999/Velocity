import { FluxStore, Role } from "..";

export namespace GuildRoleStore {
    export interface RoleMap {
        [roleId: string]: Role;
    }
}

export class GuildRoleStore extends FluxStore {
    /** Serialize all guild roles */
    serializeAllGuildRoles(): Record<string, GuildRoleStore.RoleMap>;

    /** Get mutable roles for a guild */
    getUnsafeMutableRoles(guildId: string): GuildRoleStore.RoleMap;

    /** Get multiple roles from a guild */
    getManyRoles(guildId: string, roleIds: string[]): (Role | undefined)[];

    /** Get a specific role */
    getRole(guildId: string, roleId: string): Role | undefined;

    /** Get the number of roles in a guild */
    getNumRoles(guildId: string): number;

    /** Get the @everyone role for a guild */
    getEveryoneRole(guild: any): Role;

    /** Get all roles for a guild sorted by position */
    getSortedRoles(guildId: string): Role[];

    /** Get a snapshot of all roles in a guild */
    getRolesSnapshot(guildId: string): GuildRoleStore.RoleMap;
}
