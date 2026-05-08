import { FluxStore } from "..";

export enum ApplicationSubscriptionFetchState {
    NOT_FETCHED = 0,
    FETCHING = 1,
    FETCHED = 2,
}

export namespace ApplicationSubscriptionStore {
    export interface SubscriptionGroupListing {
        id: string;
        application_id: string;
        subscription_listings_ids: string[];
        subscription_listings?: SubscriptionListing[];
    }

    export interface SubscriptionListing {
        id: string;
        application_id: string;
        subscription_listings_ids: string[];
        subscription_plans: SubscriptionPlan[];
    }

    export interface SubscriptionPlan {
        id: string;
    }

    export interface Entitlement {
        id: string;
        applicationId: string;
        guildId: string;
        isValid(user: any, store: any): boolean;
    }
}

export class ApplicationSubscriptionStore extends FluxStore {
    getSubscriptionGroupListingsForApplicationFetchState(applicationId: string): ApplicationSubscriptionFetchState;
    getSubscriptionGroupListing(groupListingId: string): ApplicationSubscriptionStore.SubscriptionGroupListing | undefined;
    getSubscriptionGroupListingForSubscriptionListing(listingId: string): ApplicationSubscriptionStore.SubscriptionGroupListing | undefined;
    getSubscriptionListing(listingId: string): ApplicationSubscriptionStore.SubscriptionListing | undefined;
    getSubscriptionListingsForApplication(applicationId: string): ApplicationSubscriptionStore.SubscriptionListing[];
    getEntitlementsForGuildFetchState(guildId: string): ApplicationSubscriptionFetchState;
    getSubscriptionListingForPlan(planId: string): ApplicationSubscriptionStore.SubscriptionListing | undefined;
    getApplicationEntitlementsForGuild(applicationId: string, guildId: string, isValid?: boolean): ApplicationSubscriptionStore.Entitlement[];
    getEntitlementsForGuild(guildId: string, isValid?: boolean): ApplicationSubscriptionStore.Entitlement[];
}
