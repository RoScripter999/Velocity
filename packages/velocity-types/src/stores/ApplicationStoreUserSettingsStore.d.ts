import { FluxStore } from "..";

export namespace ApplicationStoreUserSettingsStore {
    export interface State {
        hasAcceptedStoreTerms: boolean;
        hasAcceptedEulaIds: string[];
    }
}

export class ApplicationStoreUserSettingsStore extends FluxStore {
    getState(): ApplicationStoreUserSettingsStore.State;
    get hasAcceptedStoreTerms(): boolean;
    hasAcceptedEULA(eulaId: string): boolean;
}
