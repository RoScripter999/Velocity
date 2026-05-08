import { FluxStore } from "..";

export namespace FriendsStore {
    export interface Relationship {
        key: string;
        userId: string;
        type: number;
        status: string;
        isMobile: boolean;
        activities: any[];
        applicationStream: any;
        user: any;
        usernameLower: string | null;
        mutualGuildsLength: number;
        mutualGuilds: any[];
        nickname?: string | null;
        spam: boolean;
        giftIntentType?: number;
        ignoredUser: boolean;
        applicationId?: string;
        isGameRelationship?: boolean;
    }

    export interface RelationshipCounts {
        [key: number]: number;
    }

    export interface FriendsState {
        fetching: boolean;
        section: number;
        rows: Relationship[];
    }
}

export class FriendsStore extends FluxStore {
    getState(): FriendsStore.FriendsState;
}
