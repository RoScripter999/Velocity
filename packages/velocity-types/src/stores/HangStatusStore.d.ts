import { FluxStore } from "..";

export namespace HangStatusStore {
    export interface CustomHangStatus {
        status: string;
        emoji?: any;
    }

    export interface DefaultHangStatus {
        status: string | null;
        customHangStatus: CustomHangStatus | null;
        gameActivityHangStatus: string | null;
    }

    export interface State {
        recentStatuses: (string | CustomHangStatus)[];
        favoritedStatuses: (string | CustomHangStatus)[];
        currentDefaultStatus: DefaultHangStatus | null;
    }
}

export const MAX_FAVORITED_STATUSES: number;

export class HangStatusStore extends FluxStore {
    /** Get current state */
    getState(): HangStatusStore.State;

    /** Get current hang status */
    getCurrentHangStatus(): string | null;

    /** Get custom hang status */
    getCustomHangStatus(): HangStatusStore.CustomHangStatus | null;

    /** Get game activity hang status */
    getGameActivityHangStatus(): string | null;

    /** Get recent statuses */
    getRecentStatuses(): (string | HangStatusStore.CustomHangStatus)[];

    /** Get favorited statuses */
    getFavoritedStatuses(): (string | HangStatusStore.CustomHangStatus)[];

    /** Get current default status */
    getCurrentDefaultStatus(): HangStatusStore.DefaultHangStatus | null;

    /** Get hang status activity */
    getHangStatusActivity(): any;

    /** Check if status is favorited */
    isFavorited(status: string | HangStatusStore.CustomHangStatus): boolean;
}
