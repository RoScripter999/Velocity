import { FluxStore } from "..";

export class LowPerformanceModeStore extends FluxStore {
    /** Get current state */
    getState(): {
        enabled: boolean;
        optedOut: boolean;
    };

    /** Check if user opted out of low performance mode */
    get optedOut(): boolean;

    /** Check if low performance mode is enabled */
    get enabled(): boolean;

    /** Check if low performance mode is visible */
    get visible(): boolean;

    /** Check if low performance mode is active */
    get active(): boolean;
}
