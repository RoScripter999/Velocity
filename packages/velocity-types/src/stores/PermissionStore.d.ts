import { Channel, FluxStore, Guild } from "..";

export class PermissionStore extends FluxStore {
    /** Get computed permissions for a channel */
    getChannelPermissions(channel: Channel): bigint;

    /** Get computed permissions for a guild */
    getGuildPermissions(guildId: string | { id: string; }): bigint;

    /** Get all permission-related properties for a guild (for UI rendering) */
    getGuildPermissionProps(guild: Guild): {
        canManageGuild: boolean;
        canManageChannels: boolean;
        canManageRoles: boolean;
        canManageBans: boolean;
        canManageNicknames: boolean;
        canManageGuildExpressions: boolean;
        canViewAuditLog: boolean;
        canViewAuditLogV2: boolean;
        canManageWebhooks: boolean;
        canViewGuildAnalytics: boolean;
        canAccessMembersPage: boolean;
        isGuildAdmin: boolean;
        isOwner: boolean;
        isOwnerWithRequiredMfaLevel: boolean;
        guild: Guild;
    };

    /** Check if user can access member safety page */
    canAccessMemberSafetyPage(guild: any): boolean;

    /** Check if user can access guild settings */
    canAccessGuildSettings(guild: any): boolean;

    /** Check if user has a permission with partial context (channel or guild ID) */
    canWithPartialContext(permission: bigint, context: { channelId?: string; guildId?: string; }): boolean;

    /** Check if user has a specific permission in a context */
    can(permission: bigint, context: any, overwrites?: any, roles?: any, excludeGuildPermissions?: boolean): boolean;

    /** Check if user has a specific permission in a basic channel */
    canBasicChannel(permission: bigint, channel: any, overwrites?: any, roles?: any, excludeGuildPermissions?: boolean): boolean;

    /** Compute all permissions for a context */
    computePermissions(context: any, overwrites?: any, roles?: any, excludeGuildPermissions?: boolean): bigint;

    /** Compute basic permissions (without advanced checks) */
    computeBasicPermissions(context: any): bigint;

    /** Check if user can manage another user (considering hierarchy) */
    canManageUser(permission: bigint, userId: string | any, guild: any): boolean;

    /** Get the highest role the user has in a guild */
    getHighestRole(guild: any): any | null;

    /** Check if one role is higher than another in hierarchy */
    isRoleHigher(guild: any, role1: any, role2: any): boolean;

    /** Check if user can impersonate a role */
    canImpersonateRole(guild: any, role: any): boolean;

    /** Get cache version for a guild's permissions */
    getGuildVersion(guildId: string): number;

    /** Get cache version for all channels' permissions */
    getChannelsVersion(): number;
}
