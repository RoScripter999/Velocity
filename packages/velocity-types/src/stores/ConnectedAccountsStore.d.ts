import { FluxStore } from "..";

export type PlatformType = "twitch" | "youtube" | "skype" | "steam" | "leagueoflegends" | "battlenet" | "bluesky" | "bungie" | "reddit" | "twitter" | "twitter_legacy" | "spotify" | "facebook" | "xbox" | "samsung" | "contacts" | "instagram" | "mastodon" | "soundcloud" | "github" | "playstation" | "playstation-stg" | "epicgames" | "riotgames" | "roblox" | "paypal" | "ebay" | "tiktok" | "crunchyroll" | "domain" | "amazon-music" | "meta_quest_or_horizon";

export namespace ConnectedAccountsStore {
    export interface ConnectedAccount {
        id: string;
        type: PlatformType;
        name: string;
        revoked: boolean;
        friendSync: boolean;
        showActivity: boolean;
        twoWayLink: boolean;
        verified: boolean;
        visibility: number;
        accessToken: string | null;
        metadata: any | null;
        metadataVisibility: number;
        integrations: Integration[];
    }

    export interface Integration {
        id: string;
        type: string;
        guild: any | null;
        [key: string]: any;
    }
}

export class ConnectedAccountsStore extends FluxStore {
    isJoining(integrationId: string): boolean;
    joinErrorMessage(integrationId: string): string | undefined;
    isFetching(): boolean;
    getAccounts(): ConnectedAccountsStore.ConnectedAccount[];
    getLocalAccounts(): ConnectedAccountsStore.ConnectedAccount[];
    getAccount(accountId: string | null | undefined, type: string): ConnectedAccountsStore.ConnectedAccount | undefined;
    getLocalAccount(type: string): ConnectedAccountsStore.ConnectedAccount | undefined;
    isSuggestedAccountType(type: string): boolean;
    addPendingAuthorizedState(state: string): void;
    deletePendingAuthorizedState(state: string): void;
    hasPendingAuthorizedState(state: string): boolean;
}
