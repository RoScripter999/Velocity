import { FluxStore } from "..";

export namespace TestModeStore {
    export interface State {
        applicationId: string | null;
        originURL: string | null;
    }
}

export class TestModeStore extends FluxStore {
    /** Check if in test mode for an application */
    inTestModeForApplication(applicationId: string): boolean;

    /** Check if in test mode for an embedded application */
    inTestModeForEmbeddedApplication(applicationId: string): boolean;

    /** Check if should display test mode UI */
    shouldDisplayTestMode(applicationId: string): boolean;

    /** Get current state */
    getState(): TestModeStore.State;

    /** Check if in test mode */
    get isTestMode(): boolean;

    /** Check if fetching authorization */
    get isFetchingAuthorization(): boolean;

    /** Get test mode embedded application ID */
    get testModeEmbeddedApplicationId(): string | null;

    /** Get test mode application ID */
    get testModeApplicationId(): string | null;

    /** Get test mode origin URL */
    get testModeOriginURL(): string | null;

    /** Get authorization error */
    get error(): any;

    /** Execute callback when initialized */
    whenInitialized(callback: () => void): void;
}
