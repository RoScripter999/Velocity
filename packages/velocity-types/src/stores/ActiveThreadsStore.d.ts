import { FluxStore } from "..";

export enum ChannelSortOrder {
    Favorite = 0,
    PrivateChannel = 1,
    HighImportanceMentioned = 2,
    LowImportanceMentioned = 3,
    AllMessagesNotifications = 4,
    GuildChannel = 5,
    OldChannel = 6,
    NoNotifications = 7,
    ReallyOldChannel = 8,
}

export enum LoadState {
    Loading = "loading",
    Loaded = "loaded",
    Done = "done",
}

export namespace ActiveThreadsStore {
    export interface Thread {
        id: string;
        parentId: string;
    }

    export interface GuildThreads {
        [parentChannelId: string]: {
            [threadId: string]: Thread;
        };
    }

    export interface State {
        [guildId: string]: GuildThreads;
    }
}

export class ActiveThreadsStore extends FluxStore {
    /** Check if a thread is active */
    isActive(guildId: string, parentId: string, threadId: string): boolean;

    /** Get all threads for a guild */
    getThreadsForGuild(guildId: string): ActiveThreadsStore.GuildThreads;

    /** Get threads for a specific parent channel */
    getThreadsForParent(guildId: string, parentId: string): Record<string, ActiveThreadsStore.Thread>;

    /** Check if a channel has any threads */
    hasThreadsForChannel(guildId: string, parentId: string): boolean;

    /** Iterate over all guilds and their threads */
    forEachGuild(callback: (guildId: string, threads: ActiveThreadsStore.GuildThreads) => void): void;

    /** Check if threads have been loaded for a guild */
    hasLoaded(guildId: string): boolean;
}
