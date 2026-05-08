import { FluxStore } from "..";

export namespace ClientThemesBackgroundStore {
    export interface GradientPreset {
        id: string;
        [key: string]: any;
    }

    export interface State {
        gradientPresetId?: string;
    }
}

export class ClientThemesBackgroundStore extends FluxStore {
    getState(): ClientThemesBackgroundStore.State;
    get gradientPreset(): ClientThemesBackgroundStore.GradientPreset | undefined;
    getLinearGradient(): string | null;
    get isPreview(): boolean;
    get isCoachmark(): boolean;
    get mobilePendingThemeIndex(): any;
}
