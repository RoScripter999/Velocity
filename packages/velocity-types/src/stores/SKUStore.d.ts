import { FluxStore } from "..";

export namespace SKUStore {
    export interface SKU {
        id: string;
        application_id: string;
        bundled_sku_ids?: string[];
        child_skus?: SKU[];
        alternative_skus?: SKU[];
        [key: string]: any;
    }
}

export class SKUStore extends FluxStore {
    /** Get a SKU by ID */
    get(skuId: string): SKUStore.SKU | undefined;

    /** Get all SKUs for an application */
    getForApplication(applicationId: string): SKUStore.SKU[];

    /** Check if fetching a SKU */
    isFetching(skuId: string): boolean;

    /** Get all SKUs */
    getSKUs(): Record<string, SKUStore.SKU>;

    /** Get parent SKU for a bundled SKU */
    getParentSKU(skuId: string): SKUStore.SKU | undefined;

    /** Check if fetching a SKU failed */
    didFetchingSkuFail(skuId: string): boolean;
}
