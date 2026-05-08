import { FluxStore } from "..";

export namespace WowMomentConfirmationStore {
    export interface State {
        isDisplayingWowMomentConfirmation: boolean;
        isAnimated: boolean;
    }
}

export class WowMomentConfirmationStore extends FluxStore {
    getState(): WowMomentConfirmationStore.State;
    get isDisplayingWowMomentConfirmation(): boolean;
    get isAnimated(): boolean;
}
