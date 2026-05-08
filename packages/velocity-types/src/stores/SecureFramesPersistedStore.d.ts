import { FluxStore } from "..";

export namespace SecureFramesPersistedStore {
    export interface State {
        persistentCodesEnabled: boolean;
        uploadedKeyVersions: string[];
    }
}

export class SecureFramesPersistedStore extends FluxStore {
    /** Get current state */
    getState(): SecureFramesPersistedStore.State;

    /** Check if persistent codes are enabled */
    getPersistentCodesEnabled(): boolean;

    /** Get uploaded key versions */
    getUploadedKeyVersionsCached(): string[];
}
