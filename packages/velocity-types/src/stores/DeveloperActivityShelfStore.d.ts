import { FluxStore } from "..";

export enum DeveloperActivityShelfFetchState {
    INITIALIZED = "INITIALIZED",
    LOADING = "LOADING",
    LOADED = "LOADED",
    ERROR = "ERROR",
}

export namespace DeveloperActivityShelfStore {
    export interface State {
        lastUsedObject: Record<string, number>;
        useActivityUrlOverride: boolean;
        activityUrlOverride: string | null;
        filter: string;
    }
}

export class DeveloperActivityShelfStore extends FluxStore {
    /** Get current state */
    getState(): DeveloperActivityShelfStore.State;

    /** Check if developer activity shelf is enabled */
    getIsEnabled(): boolean;

    /** Get last used object timestamps */
    getLastUsedObject(): Record<string, number>;

    /** Check if using activity URL override */
    getUseActivityUrlOverride(): boolean;

    /** Get activity URL override */
    getActivityUrlOverride(): string | null;

    /** Get fetch state */
    getFetchState(): DeveloperActivityShelfFetchState;

    /** Get filter string */
    getFilter(): string;

    /** Get developer shelf items */
    getDeveloperShelfItems(): any[];

    /** Check if in dev mode for an application */
    inDevModeForApplication(applicationId: string): boolean;
}
