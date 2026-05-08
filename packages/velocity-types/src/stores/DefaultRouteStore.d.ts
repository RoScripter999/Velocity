import { FluxStore } from "..";

export namespace DefaultRouteStore {
    export interface State {
        lastViewedPath: string | null;
        lastViewedNonVoicePath: string | null;
    }
}

export class DefaultRouteStore extends FluxStore {
    /** Get experimental default route based on config */
    get experimentalDefaultRoute(): string;

    /** Get default route */
    get defaultRoute(): string;

    /** Get last non-voice route visited */
    get lastNonVoiceRoute(): string;

    /** Get fallback route */
    get fallbackRoute(): string;

    /** Get current state */
    getState(): DefaultRouteStore.State;
}
