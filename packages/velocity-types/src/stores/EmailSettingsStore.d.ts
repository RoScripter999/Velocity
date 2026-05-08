import { FluxStore } from "..";

export namespace EmailSettingsStore {
    export interface Settings {
        categories: Record<string, any>;
        initialized: boolean | null;
    }
}

export class EmailSettingsStore extends FluxStore {
    getEmailSettings(): EmailSettingsStore.Settings;
}
