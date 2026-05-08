import { FluxStore } from "..";

export namespace UserSettingsOverridesStore {
    export interface State {
        [key: string]: {
            reasonKey?: string;
        };
    }
}

export class UserSettingsOverridesStore extends FluxStore {
    /** Get current state */
    getState(): UserSettingsOverridesStore.State;

    /** Get the reason key for an applied override */
    getAppliedOverrideReasonKey(key: string): string | undefined;

    /** Get override for a specific setting */
    getOverride(key: string): any;
}
