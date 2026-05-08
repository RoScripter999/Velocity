import { FluxStore } from "..";

export type CacheLazyStatus = "initializing" | "cache-loaded" | "no-cache";

export namespace CacheStore {
    export interface CacheLoadedPayload {
        guilds: unknown[];
        privateChannels: unknown[];
        initialGuildChannels: unknown[];
        users: unknown[];
        messages: Record<string, unknown[]>;
        guildMembers: Record<string, unknown>;
        userSettings: Record<string, unknown>;
        userGuildSettings: unknown[];
        readStates: unknown[];
    }

    export interface ChannelHistoryCache {
        guildId: string | null;
        channelId: string | null;
        users: unknown[];
        members: unknown[];
        messages: unknown[];
    }
}

export class CacheStore extends FluxStore {
    hasCache(): boolean;
    getLazyCacheStatus(): CacheLazyStatus;
    get lastWriteTime(): number;
    canWriteCaches(connected: boolean): boolean;
    loadCacheAsync(navigationState: unknown, callback: () => void): Promise<void>;
}
