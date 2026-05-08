import { FluxStore } from "..";

export enum ApplicationStoreDirectoryFetchStatus {
    NONE = 0,
    FETCHING = 1,
    FETCHED = 2,
    FAILED = 3,
}

export class ApplicationStoreDirectoryStore extends FluxStore {
    hasStorefront(applicationId: string): boolean;
    getStoreLayout(applicationId: string): any;
    getFetchStatus(applicationId: string): ApplicationStoreDirectoryFetchStatus;
}
