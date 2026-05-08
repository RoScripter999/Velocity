import { FluxStore } from "..";

export namespace StickersPersistedStore {
    export interface PendingUsage {
        key: string;
        timestamp: number;
    }

    export interface State {
        pendingUsages: PendingUsage[];
    }
}

export class StickersPersistedStore extends FluxStore {
    /** Get current state */
    getState(): StickersPersistedStore.State;

    /** Check if there are pending sticker usages to persist */
    hasPendingUsage(): boolean;

    /** Get sticker frecency data without fetching latest from server - returns the proto buffer */
    get stickerFrecencyWithoutFetchingLatest(): any;
}
