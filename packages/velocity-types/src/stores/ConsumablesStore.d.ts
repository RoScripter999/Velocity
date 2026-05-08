import { FluxStore } from "..";

export namespace ConsumablesStore {
    export interface ConfettiState {
        emoji: string;
        boundingRect: DOMRect;
        triggerTime: number;
    }

    export interface Entitlement {
        sku_id: string;
        [key: string]: any;
    }
}

export class ConsumablesStore extends FluxStore {
    /** Get the last confetti trigger state */
    get lastConfetti(): ConsumablesStore.ConfettiState | null;

    /** Check if confetti mode is enabled */
    get confettiMode(): boolean;

    /** Get price for a SKU */
    getPrice(skuId: string): number | undefined;

    /** Check if price is currently being fetched for a SKU */
    isFetchingPrice(skuId: string): boolean;

    /** Check if there was an error fetching for a SKU */
    getErrored(skuId: string): boolean;

    /** Get entitlement for a SKU */
    getEntitlement(skuId: string): ConsumablesStore.Entitlement | undefined;

    /** Get potion count for a SKU */
    fetchPotionCount(skuId: string): number | undefined;

    /** Check if entitlement has been fetched for a SKU */
    isEntitlementFetched(skuId: string): boolean;

    /** Check if entitlement is currently being fetched for a SKU */
    isEntitlementFetching(skuId: string): boolean;

    /** Get previous go live settings, the types are unknown so i can't really type it */
    getPreviousGoLiveSettings(): any;
}
