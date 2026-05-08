import { FluxStore } from "..";

export namespace ActivityShelfStore {
    export interface State {
        usageByApplicationId: Record<string, any>;
        shelfOrder: string[];
    }
}

export class ActivityShelfStore extends FluxStore {
    /** Get current state */
    getState(): ActivityShelfStore.State;
}
