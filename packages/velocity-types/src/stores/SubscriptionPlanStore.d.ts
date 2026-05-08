import { FluxStore } from "..";

export namespace SubscriptionPlanStore {
    export interface SubscriptionPlan {
        id: string;
        name: string;
        skuId: string;
        interval: string;
        intervalCount: number;
        taxInclusive: boolean;
        currency: string;
        price: number;
        priceTier: number;
        prices: Record<string, any>;
        [key: string]: any;
    }
}

export class SubscriptionPlanStore extends FluxStore {
    /** Get plan IDs for multiple SKUs */
    getPlanIdsForSkus(skuIds: string[]): string[];

    /** Get all fetched SKU IDs */
    getFetchedSKUIDs(): string[];

    /** Get plans for a SKU */
    getForSKU(skuId: string): SubscriptionPlanStore.SubscriptionPlan[];

    /** Get plan for SKU with specific interval */
    getForSkuAndInterval(skuId: string, interval: string, intervalCount?: number): SubscriptionPlanStore.SubscriptionPlan | undefined;

    /** Get a specific plan */
    get(planId: string): SubscriptionPlanStore.SubscriptionPlan | undefined;

    /** Check if fetching plans for a SKU */
    isFetchingForSKU(skuId: string): boolean;

    /** Check if fetching plans for multiple SKUs */
    isFetchingForSKUs(skuIds: string[]): boolean;

    /** Check if plans are loaded for a SKU */
    isLoadedForSKU(skuId: string): boolean;

    /** Check if plans are loaded for multiple SKUs */
    isLoadedForSKUs(skuIds: string[]): boolean;

    /** Check if fetching for premium SKUs */
    isFetchingForPremiumSKUs(): boolean;

    /** Check if loaded for premium SKUs */
    isLoadedForPremiumSKUs(): boolean;

    /** Ignore fetch for a SKU */
    ignoreSKUFetch(skuId: string): void;

    /** Get payment sources for a plan */
    getPaymentSourcesForPlanId(planId: string): Set<string> | null;

    /** Get all payment source IDs */
    getPaymentSourceIds(): Set<string>;

    /** Check if payment source exists for SKU */
    hasPaymentSourceForSKUId(paymentSourceId: string, skuId: string): boolean;

    /** Check if payment sources exist for multiple SKUs */
    hasPaymentSourceForSKUIds(paymentSourceId: string, skuIds: string[]): boolean;
}
