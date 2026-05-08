import { FluxStore } from "..";

export namespace SoundpackStore {
    export interface State {
        soundpack: string;
        lastSoundpackExperimentId: string | null;
    }
}

export class SoundpackStore extends FluxStore {
    /** Get current state */
    getState(): SoundpackStore.State;

    /** Get the currently selected soundpack */
    getSoundpack(): string;

    /** Get the last soundpack experiment ID */
    getLastSoundpackExperimentId(): string | null;
}
