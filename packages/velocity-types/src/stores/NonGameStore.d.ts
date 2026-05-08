import { FluxStore } from "..";

export namespace NonGameStore {
    export interface NonGame {
        id: string;
        name: string;
        executables: Array<{
            name: string;
            [key: string]: any;
        }>;
        aliases: string[];
        icon?: string;
        thirdPartySkus: any[];
    }

    export interface State {
        etag: string;
        nonGames: NonGame[];
    }
}

export class NonGameStore extends FluxStore {
    /** Get current state */
    getState(): NonGameStore.State;

    /** Get all non-games */
    get nonGames(): NonGameStore.NonGame[];

    /** Check if fetching non-games */
    get fetching(): boolean;

    /** Get etag */
    get etag(): string;

    /** Get last fetch timestamp */
    get lastFetched(): number | null;

    /** Check if fetch has been attempted */
    get hasAttemptedFetch(): boolean;

    /** Get TTL for non-games cache */
    get ttl(): number;

    /** Get non-game by ID */
    getById(id: string): NonGameStore.NonGame | undefined;

    /** Check if non-games can be fetched */
    canFetch(): boolean;
}
