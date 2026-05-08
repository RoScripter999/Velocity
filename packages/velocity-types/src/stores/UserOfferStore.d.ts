import { FluxStore } from "..";

export namespace UserOfferStore {
    export interface UserTrialOffer {
        trial_id: string;
        user_id: string;
        expires_at?: string;
        subscription_trial?: {
            sku_id: string;
        };
        referrer?: any;
    }

    export interface UserDiscount {
        discount_id: string;
        expires_at?: string;
    }

    export interface UserDiscountOffer {
        discount_id: string;
        expires_at?: string;
        discount?: {
            plan_ids: number[];
        };
    }

    export interface State {
        userOffersLastFetchedAtDate?: number;
        userTrialOffers: Record<string, UserTrialOffer>;
        userDiscountOffers: Record<string, UserDiscountOffer | UserDiscount>;
        userDiscounts?: Record<string, UserDiscount>;
        isFetching: boolean;
        lastFetchSuccessful: boolean;
    }
}

export class UserOfferStore extends FluxStore {
    getUserTrialOffer(trialId: string | null): UserOfferStore.UserTrialOffer | undefined;
    getUserDiscountOffer(discountId: string | null): UserOfferStore.UserDiscountOffer | UserOfferStore.UserDiscount | undefined;
    getAnyOfUserTrialOfferId(trialIds: string[]): string | null;
    isFetchingOffer(): boolean;
    hasFetchedOffer(): boolean;
    shouldFetchReferralOffer(lastFetchTime?: number): boolean;
    getAlmostExpiringTrialOffers(skuIds: string[]): UserOfferStore.UserTrialOffer[];
    getAlmostExpiringDiscountOffers(skuIds: string[]): (UserOfferStore.UserDiscountOffer | UserOfferStore.UserDiscount)[];
    getAcknowledgedOffers(trialIds: string[]): UserOfferStore.UserTrialOffer[];
    getUnacknowledgedDiscountOffers(): (UserOfferStore.UserDiscountOffer | UserOfferStore.UserDiscount)[];
    getUnacknowledgedOffers(trialIds: string[]): UserOfferStore.UserTrialOffer[];
    hasAnyUnexpiredOffer(): boolean;
    hasAnyUnexpiredDiscountOffer(): boolean;
    canFractionalPremiumUserUseOffer(): boolean;
    getReferrer(trialId: string | null): any;
    getState(): UserOfferStore.State;
    forceReset(): void;
    lastFetchSuccessful(): boolean;
}
