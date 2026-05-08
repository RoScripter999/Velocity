import { FluxStore } from "..";

export namespace FrecencyStore {
    export interface PendingUsage {
        key: string;
        timestamp: number;
    }

    export interface State {
        pendingUsages: PendingUsage[];
    }
}

export class FrecencyStore extends FluxStore {
    /** Get current state */
    getState(): FrecencyStore.State;

    /** Check if there are pending usages */
    hasPendingUsage(): boolean;

    /** Get frecency calculator without fetching latest */
    get frecencyWithoutFetchingLatest(): any;

    /** Get frequently used items without fetching latest */
    getFrequentlyWithoutFetchingLatest(): any[];

    /** Get frecency score for an item */
    getScoreWithoutFetchingLatest(key: string): number;

    /** Get frecency score for a DM with a user */
    getScoreForDMWithoutFetchingLatest(userId: string): number;

    /** Get maximum possible score */
    getMaxScore(): number;

    /** Get bonus score multiplier */
    getBonusScore(): number;
}
