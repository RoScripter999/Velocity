import { FluxStore } from "..";

export namespace CollectiblesShopHomesStore {
    export interface ShopBlock {
        [key: string]: any;
    }

    export interface FetchOptions {
        [key: string]: any;
    }
}

export class CollectiblesShopHomesStore extends FluxStore {
    /** Get last successful fetch timestamp for a tab */
    getLastSuccessfulFetch(tab: string): number | undefined;

    /** Get last error timestamp for a tab */
    getLastErrorTimestamp(tab: string): number | undefined;

    /** Get last fetch options for a tab */
    getLastFetchOptions(tab: string): CollectiblesShopHomesStore.FetchOptions | undefined;

    /** Get fetch error for a tab */
    getFetchShopHomeError(tab: string): any;

    /** Check if fetching shop home for a tab */
    getIsFetchingShopHome(tab: string): boolean | undefined;

    /** Get shop blocks for a tab */
    getShopBlocks(tab: string): CollectiblesShopHomesStore.ShopBlock[];

    /** Check if has known stale data for a tab */
    getHasKnownStaleData(tab: string): boolean | undefined;

    /** Get shop home config override */
    getShopHomeConfigOverride(): any;
}
