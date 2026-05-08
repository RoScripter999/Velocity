import { FluxStore } from "..";

export class SubscriptionRoleStore extends FluxStore {
    /** Get all guild IDs with purchasable roles */
    getGuildIdsWithPurchasableRoles(): Set<string>;

    /** Build roles cache for a guild */
    buildRoles(guildId: string): void;

    /** Get all subscription roles in a guild */
    getSubscriptionRoles(guildId: string): Set<string>;

    /** Get purchasable subscription roles in a guild */
    getPurchasableSubscriptionRoles(guildId: string): Set<string>;

    /** Get subscription roles the user has in a guild */
    getUserSubscriptionRoles(guildId: string): Set<string>;

    /** Check if user is admin in a guild */
    getUserIsAdmin(guildId: string): boolean;
}
