import { FluxStore } from "..";

export enum ApplicationDirectorySearchFetchState {
    FETCHING = 0,
    FETCHED = 1,
    ERROR = 2
}

export namespace ApplicationDirectorySearchStore {
    export interface SearchResult {
        lastFetchTimeMs: number;
        [key: string]: any;
    }

    export interface SearchOptions {
        query: string;
        guildId?: string;
        page: number;
        pageSize: number;
        categoryId?: string;
        integrationType?: string;
        minUserInstallCommandCount?: number;
        excludeAppsWithCustomInstallUrl?: boolean;
        excludeNonEmbeddedApps?: boolean;
        excludeEmbeddedAppsWithoutPrimaryEntryPointAppCommand?: boolean;
        source?: string;
    }
}

export class ApplicationDirectorySearchStore extends FluxStore {
    getSearchResults(options: ApplicationDirectorySearchStore.SearchOptions): ApplicationDirectorySearchStore.SearchResult | undefined;
    getFetchState(options: ApplicationDirectorySearchStore.SearchOptions): ApplicationDirectorySearchFetchState | undefined;
}
