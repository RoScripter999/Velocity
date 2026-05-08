import { FluxStore, Message } from "..";

export namespace ThreadMessageStore {
    export interface ThreadMessageInfo {
        guildId: string;
        parentId: string;
        count: number;
        mostRecentRawMessage: Message | null;
        mostRecentMessage: Message | null;
    }

    export interface State {
        [threadId: string]: ThreadMessageInfo;
    }
}

export class ThreadMessageStore extends FluxStore {
    /** Get message count for a thread */
    getCount(threadId: string): number | null;

    /** Get the most recent message in a thread */
    getMostRecentMessage(threadId: string): Message | null;

    /** Get the version number for a channel's threads (used for cache invalidation) */
    getChannelThreadsVersion(channelId: string): number | undefined;

    /** Get initial overlay state */
    getInitialOverlayState(): ThreadMessageStore.State;
}
