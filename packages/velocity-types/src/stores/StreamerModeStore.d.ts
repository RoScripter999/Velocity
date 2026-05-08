import { FluxStore } from "..";

export namespace StreamerModeStore {
    export interface StreamerModeSettings {
        enabled: boolean;
        autoToggle: boolean;
        hideInstantInvites: boolean;
        hidePersonalInformation: boolean;
        disableSounds: boolean;
        disableNotifications: boolean;
        enableContentProtection: boolean;
    }
}

export class StreamerModeStore extends FluxStore {
    getState(): Record<string, StreamerModeStore.StreamerModeSettings>;
    getSettings(): StreamerModeStore.StreamerModeSettings;
    get enabled(): boolean;
    get autoToggle(): boolean;
    get hideInstantInvites(): boolean;
    get hidePersonalInformation(): boolean;
    get disableSounds(): boolean;
    get disableNotifications(): boolean;
    get enableContentProtection(): boolean;
}
