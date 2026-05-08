import { FluxStore } from "..";

export enum ApplicationAssetFetchState {
    NOT_FETCHED = 0,
    FETCHING = 1,
    FETCHED = 2
}

export interface Asset {
    name: string;
    [key: string]: any;
}

export interface ApplicationAssets {
    assets: Record<string, Asset>;
    lastUpdated: number;
}

export class ApplicationAssetsStore extends FluxStore {
    getApplicationAssetFetchState(applicationId: string): ApplicationAssetFetchState;
    getFetchingIds(): string[];
    getApplicationAssets(applicationId: string): ApplicationAssets | undefined;
}
