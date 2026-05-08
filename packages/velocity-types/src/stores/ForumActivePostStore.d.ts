import { FluxStore } from "..";

export class ForumActivePostStore extends FluxStore {
    /** Get count of new threads created by other users */
    getNewThreadCount(): number;

    /** Check if threads can be acknowledged */
    getCanAckThreads(): boolean;

    /** Get thread IDs for a forum channel with filters and sorting */
    getThreadIds(channelId: string, sortBy: string, tags: Set<string>, tagFilterMode: string): string[];

    /** Get currently displayed thread IDs */
    getCurrentThreadIds(): string[];

    /** Get and remove the most recently created thread ID by current user */
    getAndDeleteMostRecentUserCreatedThreadId(): string | null;

    /** Get the first thread with no replies */
    getFirstNoReplyThreadId(): string | null;
}
