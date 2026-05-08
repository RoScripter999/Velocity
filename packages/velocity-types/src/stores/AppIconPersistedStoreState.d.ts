import { FluxStore } from "..";

export interface AppIconState {
    client: {
        desktop: string;
        coachmarkImpressions: number;
    };
}

export class AppIconPersistedStoreState extends FluxStore {
    get isUpsellPreview(): boolean;
    getState(): AppIconState;
    getCurrentDesktopIcon(): string | undefined;
}
