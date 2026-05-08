import { FluxStore } from "..";

export namespace PoggermodeSettingsStore {
    export interface State {
        settingsVisible: boolean;
        enabled: boolean;
        combosEnabled: boolean;
        combosRequiredCount: number;
        comboSoundsEnabled: boolean;
        screenshakeEnabled: boolean;
        screenshakeEnabledLocations: Record<string, boolean>;
        shakeIntensity: number;
        confettiEnabled: boolean;
        confettiEnabledLocations: Record<string, boolean>;
        confettiSize: number;
        confettiCount: number;
        warningSeen: boolean;
    }
}

export class PoggermodeSettingsStore extends FluxStore {
    /** Get current state */
    getUserAgnosticState(): PoggermodeSettingsStore.State;

    /** Check if settings panel is visible */
    get settingsVisible(): boolean;

    /** Check if poggermode is enabled for given locations */
    isEnabled(options?: { confettiLocation?: string; shakeLocation?: string; }): boolean;

    /** Get shake intensity (0 if disabled) */
    get shakeIntensity(): number;

    /** Get required combo count (0 if disabled) */
    get combosRequiredCount(): number;

    /** Check if screenshake is enabled */
    get screenshakeEnabled(): boolean;

    /** Get screenshake enabled locations */
    get screenshakeEnabledLocations(): Record<string, boolean>;

    /** Check if combos are enabled */
    get combosEnabled(): boolean;

    /** Check if combo sounds are enabled */
    get comboSoundsEnabled(): boolean;
}
