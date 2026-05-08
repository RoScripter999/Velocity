import { FluxStore } from "..";

export namespace VoiceFilterPersistedStore {
    export interface State {
        lastInitAttemptMayHaveCrashed: boolean;
    }
}

export class VoiceFilterPersistedStore extends FluxStore {
    /** Get current state */
    getState(): VoiceFilterPersistedStore.State;

    /** Check if last init attempt may have crashed */
    getLastInitAttemptMayHaveCrashed(): boolean;
}
