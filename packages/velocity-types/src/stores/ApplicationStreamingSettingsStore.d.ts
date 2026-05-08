import { FluxStore } from "..";

export namespace ApplicationStreamingSettingsStore {
    export interface State {
        preset: ApplicationStreamPresets;
        resolution: ApplicationStreamResolutions;
        fps: ApplicationStreamFPS;
        soundshareEnabled: boolean;
    }
}

export enum ApplicationStreamResolutions {
    RESOLUTION_480 = 480,
    RESOLUTION_720 = 720,
    RESOLUTION_1080 = 1080,
    RESOLUTION_1440 = 1440,
    RESOLUTION_SOURCE = 0,
}

export enum ApplicationStreamFPS {
    FPS_5 = 5,
    FPS_15 = 15,
    FPS_30 = 30,
    FPS_60 = 60,
}

export enum ApplicationStreamPresets {
    PRESET_VIDEO = 1,
    PRESET_DOCUMENTS = 2,
    PRESET_CUSTOM = 3,
    PRESET_AUTO = 4,
}

export class ApplicationStreamingSettingsStore extends FluxStore {
    /** Get current streaming settings state */
    getState(): ApplicationStreamingSettingsStore.State;
}
