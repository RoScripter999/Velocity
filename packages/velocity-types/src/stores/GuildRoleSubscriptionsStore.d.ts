import { FluxStore } from "..";

export enum GuildRoleSubscriptionsFetchState {
    NOT_FETCHED = 0,
    FETCHING = 1,
    FETCHED = 2,
}

export namespace GuildRoleSubscriptionsStore {
    export interface SubscriptionGroupListing {
        id: string;
        guild_id: string;
        application_id: string;
        subscription_listings_ids: string[];
        [key: string]: any;
    }

    export interface SubscriptionListing {
        id: string;
        application_id: string;
        subscription_plans: Array<{
            id: string;
            [key: string]: any;
        }>;
        [key: string]: any;
    }

    export interface SubscriptionSettings {
        guild_id: string;
        [key: string]: any;
    }

    export interface SubscriptionTrial {
        id: string;
        [key: string]: any;
    }
}

export class GuildRoleSubscriptionsStore extends FluxStore {
    /** Get fetch state for subscription group listings */
    getSubscriptionGroupListingsForGuildFetchState(guildId: string): GuildRoleSubscriptionsFetchState;

    /** Check if listing was fetched for a subscription plan */
    getDidFetchListingForSubscriptionPlanId(planId: string): boolean;

    /** Get a subscription group listing */
    getSubscriptionGroupListing(listingId: string): GuildRoleSubscriptionsStore.SubscriptionGroupListing | undefined;

    /** Get all subscription group listings for a guild */
    getSubscriptionGroupListingsForGuild(guildId: string): GuildRoleSubscriptionsStore.SubscriptionGroupListing[];

    /** Get the group listing for a subscription listing */
    getSubscriptionGroupListingForSubscriptionListing(listingId: string): GuildRoleSubscriptionsStore.SubscriptionGroupListing | undefined;

    /** Get a subscription listing */
    getSubscriptionListing(listingId: string): GuildRoleSubscriptionsStore.SubscriptionListing | undefined;

    /** Get all subscription listings for a guild */
    getSubscriptionListingsForGuild(guildId: string): GuildRoleSubscriptionsStore.SubscriptionListing[];

    /** Get subscription listing for a plan */
    getSubscriptionListingForPlan(planId: string): GuildRoleSubscriptionsStore.SubscriptionListing | undefined;

    /** Get subscription settings for a guild */
    getSubscriptionSettings(guildId: string): GuildRoleSubscriptionsStore.SubscriptionSettings | undefined;

    /** Get a subscription trial */
    getSubscriptionTrial(trialId: string): GuildRoleSubscriptionsStore.SubscriptionTrial | undefined;

    /** Get monetization restrictions for a guild */
    getMonetizationRestrictions(guildId: string): any;

    /** Get fetch state for monetization restrictions */
    getMonetizationRestrictionsFetchState(guildId: string): GuildRoleSubscriptionsFetchState;

    /** Get application ID for a guild */
    getApplicationIdForGuild(guildId: string): string | undefined;
}
