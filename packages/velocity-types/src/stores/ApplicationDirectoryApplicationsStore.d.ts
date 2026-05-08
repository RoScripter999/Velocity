import { FluxStore } from "..";

export enum ApplicationFetchState {
    FETCHING = 0,
    FETCHED = 1,
    ERROR = 2
}

export namespace ApplicationDirectoryApplicationsStore {
    export interface Application {
        id: string;
        name: string;
        description?: string;
        icon?: string;
        [key: string]: any;
    }
}

export class ApplicationDirectoryApplicationsStore extends FluxStore {
    getApplication(applicationId: string): ApplicationDirectoryApplicationsStore.Application | undefined;
    getApplicationRecord(applicationId: string): any;
    getApplications(): Record<string, ApplicationDirectoryApplicationsStore.Application>;
    getApplicationFetchState(applicationId: string): ApplicationFetchState | undefined;
    getApplicationFetchStates(): Record<string, ApplicationFetchState>;
    isInvalidApplication(applicationId: string): boolean;
    getInvalidApplicationIds(): Set<string>;
    isFetching(applicationId: string): boolean;
    getApplicationLastFetchTime(applicationId: string): number | undefined;
}
