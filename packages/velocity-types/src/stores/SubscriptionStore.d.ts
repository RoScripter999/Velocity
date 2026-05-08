import { FluxStore } from "..";

export namespace SubscriptionStore {
    export interface Subscription {
        id: string;
        userId: string;
        user_id: string;
        type: string;
        status: string;
        planId: string;
        trialId?: string;
        paymentSourceId?: string;
        items: Array<{
            planId: string;
            [key: string]: any;
        }>;
        hasAnyPremiumGroup?: boolean;
        [key: string]: any;
    }
}

export class SubscriptionStore extends FluxStore {
    /** Check if subscriptions have been fetched */
    hasFetchedSubscriptions(): boolean;

    /** Check if most recent premium type subscription has been fetched */
    hasFetchedMostRecentPremiumTypeSubscription(): boolean;

    /** Check if previous premium type subscription has been fetched */
    hasFetchedPreviousPremiumTypeSubscription(): boolean;

    /** Get premium subscription */
    getPremiumSubscription(onlyActive?: boolean): SubscriptionStore.Subscription | null;

    /** Get premium type subscription */
    getPremiumTypeSubscription(onlyActive?: boolean): SubscriptionStore.Subscription | null;

    /** Check if in reverse trial */
    inReverseTrial(): boolean;

    /** Get all subscriptions */
    getSubscriptions(onlyActive?: boolean): Record<string, SubscriptionStore.Subscription> | null;

    /** Get subscription by ID */
    getSubscriptionById(subscriptionId: string): SubscriptionStore.Subscription | undefined;

    /** Get active guild subscriptions */
    getActiveGuildSubscriptions(): SubscriptionStore.Subscription[] | null;

    /** Get active application subscriptions */
    getActiveApplicationSubscriptions(): SubscriptionStore.Subscription[] | null;

    /** Get subscription for plan IDs */
    getSubscriptionForPlanIds(planIds: string[], onlyActive?: boolean): SubscriptionStore.Subscription | null;

    /** Get most recent premium type subscription */
    getMostRecentPremiumTypeSubscription(): SubscriptionStore.Subscription | null;

    /** Get previous premium type subscription */
    getPreviousPremiumTypeSubscription(): SubscriptionStore.Subscription | null;

    /** Check if subscription is eligible for reward */
    getIsSubscriptionEligibleForReward(): boolean | null;

    /** Check if fetching subscription reward eligibility */
    getIsFetchingSubscriptionRewardEligibility(): boolean;

    /** Check if fetching most recent subscription */
    getIsFetchingMostRecentSubscription(): boolean;

    /** Get last lazy perk sync timestamp */
    getLastLazyPerkSync(): number | null;

    /** Get premium group subscription */
    getPremiumGroupSubscription(): SubscriptionStore.Subscription | null;
}
