import { FluxStore } from "..";

export namespace SelectivelySyncedUserSettingsStore {
    export interface SyncSettings {
        shouldSync: boolean;
        settings: Record<string, any>;
    }

    export interface State {
        [key: string]: SyncSettings;
    }
}

export class SelectivelySyncedUserSettingsStore extends FluxStore {
    /** Get current state */
    getState(): SelectivelySyncedUserSettingsStore.State;

    /** Check if a setting category should sync */
    shouldSync(category: string): boolean;

    /** Get text settings that aren't synced */
    getTextSettings(): Record<string, any> | undefined;

    /** Get appearance settings that aren't synced */
    getAppearanceSettings(): Record<string, any> | undefined;
}
