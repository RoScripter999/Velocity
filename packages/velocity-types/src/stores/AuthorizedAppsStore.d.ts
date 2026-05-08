import { FluxStore } from "..";

export enum AuthorizedAppsFetchState {
    NOT_FETCHED = "NOT_FETCHED",
    FETCHING = "FETCHING",
    FETCHED = "FETCHED",
}

export namespace AuthorizedAppsStore {
    export interface Token {
        id: string;
        application: any;
        scopes: string[];
    }
}

export class AuthorizedAppsStore extends FluxStore {
    getNewestTokenForApplication(applicationId: string): AuthorizedAppsStore.Token | null;
    getNewestTokens(): AuthorizedAppsStore.Token[];
    getNewestTokensForNonChildrenApplications(): AuthorizedAppsStore.Token[];
    getFetchState(): AuthorizedAppsFetchState;
    getFetchStateForApplication(applicationId: string): AuthorizedAppsFetchState;
}
