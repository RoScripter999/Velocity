import { FluxStore } from "..";

export namespace ReadStateStore {
    export enum ReadStateType {
        CHANNEL = 0,
        GUILD_HOME = 1,
        GUILD_EVENT = 2,
        NOTIFICATION_CENTER = 3,
        MESSAGE_REQUESTS = 4,
        GUILD_ONBOARDING_QUESTION = 5
    }

    export interface ReadState {
        channelId: string;
        type: ReadStateStore.ReadStateType;
        ackMessageId: string | null;
        lastMessageId: string | null;
        ackPinTimestamp: number;
        lastPinTimestamp: number;
        unreadCount: number;
        mentionCount: number;
        /** Whether the mention is low importance */
        isMentionLowImportance: boolean;
        /** Whether this read state is manually acknowledged */
        isManualAck: boolean;
        /** Whether the unread count is estimated */
        estimated: boolean;
        /** Whether this has been persisted to the server */
        _persisted: boolean;
    }

    /** Guild-specific unread state information */
    export interface GuildChannelUnreadState {
        mentionCount: number;
        unread: boolean;
        isMentionLowImportance: boolean;
    }
}

export class ReadStateStore extends FluxStore {
    /** Get all read states for channels */
    getReadStatesByChannel(): Map<string, ReadStateStore.ReadState>;

    /** Check if a channel has unread messages */
    hasUnread(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Check if a channel has unread messages or mentions */
    hasUnreadOrMentions(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Check if a channel has unread messages that are being tracked */
    hasTrackedUnread(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Check if a forum post is unread */
    isForumPostUnread(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Get the count of unread messages in a channel */
    getUnreadCount(channelId: string, readStateType?: ReadStateStore.ReadStateType): number;

    /** Get the count of mentions in a channel */
    getMentionCount(channelId: string, readStateType?: ReadStateStore.ReadStateType): number;

    /** Check if mentions in a channel are low importance */
    getIsMentionLowImportance(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Get the unread state for a guild channel */
    getGuildChannelUnreadState(channel: any, isOptInEnabled: boolean, isOptInChannel: boolean, isCategory: boolean, isResource: boolean): ReadStateStore.GuildChannelUnreadState;

    /** Check if a channel was recently visited and read */
    hasRecentlyVisitedAndRead(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Get the ID of the last acknowledged message */
    ackMessageId(channelId: string, readStateType?: ReadStateStore.ReadStateType): string | null;

    /** Get the ID of the last message in a channel */
    lastMessageId(channelId: string, readStateType?: ReadStateStore.ReadStateType): string | null;

    /** Get the timestamp of the last message */
    lastMessageTimestamp(channelId: string, readStateType?: ReadStateStore.ReadStateType): number;

    /** Get the timestamp of the last pin */
    lastPinTimestamp(channelId: string): number | null;

    /** Get the ID of the oldest unread message */
    getOldestUnreadMessageId(channelId: string, readStateType?: ReadStateStore.ReadStateType): string | null;

    /** Get the timestamp of the oldest unread message */
    getOldestUnreadTimestamp(channelId: string, readStateType?: ReadStateStore.ReadStateType): number;

    /** Check if the unread count is estimated */
    isEstimated(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Check if a thread has been opened/viewed */
    hasOpenedThread(channelId: string, readStateType?: ReadStateStore.ReadStateType): boolean;

    /** Check if a channel has unread pins */
    hasUnreadPins(channelId: string): boolean;

    /** Check if a forum thread is new (created after visiting parent) */
    isNewForumThread(threadId: string, parentChannelId: string, guild: any): boolean;

    /** Get all read states (for persistence/serialization) */
    getAllReadStates(includeAllFields: boolean): ReadStateStore.ReadState[];

    /** Get the guild unreads sentinel value */
    getGuildUnreadsSentinel(guildId: string): number;

    /** Get all channel IDs that have mentions */
    getMentionChannelIds(): string[];

    /** Get the acknowledge ID for non-channel read states */
    getNonChannelAckId(readStateType: ReadStateStore.ReadStateType): string | null;

    /** Get a snapshot of the current read state (for undo/restore) */
    getSnapshot(channelId: string, maxAge: number): any;

    /** Get all channel IDs for a specific window ID */
    getChannelIdsForWindowId(windowId: string): string[];

    /** Get read state for debugging purposes */
    getForDebugging(channelId: string, readStateType?: ReadStateStore.ReadStateType): ReadStateStore.ReadState | undefined;
}
