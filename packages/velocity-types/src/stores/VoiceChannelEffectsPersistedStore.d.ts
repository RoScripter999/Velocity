import { FluxStore } from "..";

export namespace VoiceChannelEffectsPersistedStore {
    export interface State {
        animationType: string;
    }
}

export class VoiceChannelEffectsPersistedStore extends FluxStore {
    /** Get current state */
    getState(): VoiceChannelEffectsPersistedStore.State;
}
