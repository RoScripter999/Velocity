import { FluxStore } from "..";

export namespace UserAffinitiesV2Store {
    export interface UserAffinity {
        otherUserId: string;
        communicationProbability: number;
        vcProbability: number;
        communicationRank: number;
    }

    export interface UserFlags {
        [userId: string]: any;
    }

    export interface State {
        userAffinities: UserAffinity[];
        userFlags: UserFlags;
        lastFetched: number;
    }
}

export class UserAffinitiesV2Store extends FluxStore {
    shouldFetch(): boolean;
    isFetching(): boolean;
    getUserAffinities(): UserAffinitiesV2Store.UserAffinity[];
    getUserAffinitiesMap(): Map<string, UserAffinitiesV2Store.UserAffinity>;
    getUserFlags(): UserAffinitiesV2Store.UserFlags;
    compare(userId1: string, userId2: string): number;
    getUserAffinity(userId: string): UserAffinitiesV2Store.UserAffinity | undefined;
    getState(): UserAffinitiesV2Store.State;
    isHighlyAffinedVCUser(userId: string): boolean;
}
