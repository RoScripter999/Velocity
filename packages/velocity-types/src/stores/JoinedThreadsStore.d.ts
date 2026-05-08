import { FluxStore } from "..";

export namespace JoinedThreadsStore {
    export interface ThreadMember {
        threadId: string;
        guildId: string;
        flags: number;
        muted: boolean;
        muteConfig?: {
            end_time?: string;
        };
        joinTimestamp: Date;
    }
}

export class JoinedThreadsStore extends FluxStore {
    /** Check if user has joined a thread */
    hasJoined(threadId: string): boolean;

    /** Get join timestamp for a thread */
    joinTimestamp(threadId: string): Date | undefined;

    /** Get flags for a thread */
    flags(threadId: string): number | undefined;

    /** Get initial overlay state */
    getInitialOverlayState(): JoinedThreadsStore.ThreadMember[];

    /** Get mute config for a thread */
    getMuteConfig(threadId: string): { end_time?: string; } | undefined;

    /** Get all muted threads */
    getMutedThreads(): Set<string>;

    /** Check if a thread is muted */
    isMuted(threadId: string): boolean;
}
