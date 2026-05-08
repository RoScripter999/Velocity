import { FluxStore } from "..";

export namespace DevToolsDesignTogglesStore {
    export interface State {
        toggleStates: Record<string, boolean>;
    }
}

export class DevToolsDesignTogglesStore extends FluxStore {
    /** Get current state */
    getUserAgnosticState(): DevToolsDesignTogglesStore.State;

    /** Get toggle value by key */
    get(toggle: string): boolean;

    /** Set toggle value */
    set(toggle: string, value: boolean): boolean;

    /** Get all toggle states */
    all(): Record<string, boolean>;

    /** Get all toggles with their descriptions */
    allWithDescriptions(): Array<[string, boolean, string]>;
}
