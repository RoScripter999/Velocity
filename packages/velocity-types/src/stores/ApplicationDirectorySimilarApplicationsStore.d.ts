import { FluxStore } from "..";

export enum ApplicationDirectorySimilarApplicationsFetchState {
    NOT_FETCHED = 0,
    FETCHING = 1,
    FETCHED = 2,
    ERROR = 3
}

export namespace ApplicationDirectorySimilarApplicationsStore {
    export interface SimilarApplication {
        [key: string]: any;
    }

    export interface SimilarApplicationsResult {
        lastFetchTimeMs: number;
        applications: SimilarApplication[];
        loadId: string;
        page: number;
        totalPages: number;
    }

    export interface FetchOptions {
        applicationId: string;
        guildId?: string;
        page: number;
    }
}

export class ApplicationDirectorySimilarApplicationsStore extends FluxStore {
    getSimilarApplications(options: ApplicationDirectorySimilarApplicationsStore.FetchOptions): ApplicationDirectorySimilarApplicationsStore.SimilarApplicationsResult | undefined;
    getFetchState(options: ApplicationDirectorySimilarApplicationsStore.FetchOptions): ApplicationDirectorySimilarApplicationsFetchState | undefined;
}
