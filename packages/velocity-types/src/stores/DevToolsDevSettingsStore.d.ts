import { FluxStore } from "..";

export enum DevToolsCategory {
    MESSAGING = 0,
    OVERLAYS = 1,
    PREMIUM = 2,
    REPORTING = 3,
    APP_COLLECTIONS = 4,
    SHOP = 5,
    LIBDISCORE = 6,
}

export namespace DevToolsDevSettingsStore {
    export interface DevSetting {
        label: string;
        category: DevToolsCategory;
    }

    export interface State {
        toggleStates: Record<string, boolean>;
    }
}

export class DevToolsDevSettingsStore extends FluxStore {
    /** Get user agnostic state */
    getUserAgnosticState(): DevToolsDevSettingsStore.State;

    /** Check if a dev setting is enabled */
    get(settingKey: string): boolean;

    /** Get all enabled dev settings */
    enabled(): Record<string, boolean>;

    /** Get all dev settings by category */
    allByCategory(category: DevToolsCategory): Array<[string, boolean, DevToolsDevSettingsStore.DevSetting]>;
}
