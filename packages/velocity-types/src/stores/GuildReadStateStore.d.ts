import { FluxStore } from "..";

export namespace GuildReadStateStore {
    export interface UnreadByType {
        [readStateType: string]: boolean;
    }

    export interface MentionCount {
        count: number;
        isMentionLowImportance: boolean;
    }

    export interface GuildReadState {
        unread: boolean;
        unreadByType: UnreadByType;
        unreadChannelId: string | null;
        lowImportanceMentionCount: number;
        highImportanceMentionCount: number;
        mentionCounts: Record<string, MentionCount>;
        ncMentionCount: number;
        sentinel: number;
    }

    export interface Snapshot {
        version: number;
        data: {
            guilds: Record<string, GuildReadState>;
            unreadGuilds: string[];
        };
    }
}

export class GuildReadStateStore extends FluxStore {
    /** Load cached snapshot */
    loadCache(): void;

    /** Take a snapshot of current state */
    takeSnapshot(): GuildReadStateStore.Snapshot;

    /** Check if any guilds have unread messages */
    hasAnyUnread(): boolean;

    /** Get store change sentinel (incremented on changes) */
    getStoreChangeSentinel(): number;

    /** Get mutable unread guilds set */
    getMutableUnreadGuilds(): Set<string>;

    /** Get mutable guild states */
    getMutableGuildStates(): Record<string, GuildReadStateStore.GuildReadState>;

    /** Check if a guild has unread messages */
    hasUnread(guildId: string): boolean;

    /** Get mention count for a guild */
    getMentionCount(guildId: string): number;

    /** Check if guild mentions are low importance only */
    getIsMentionLowImportance(guildId: string): boolean;

    /** Check if guild has unread ignoring mute settings */
    getGuildHasUnreadIgnoreMuted(guildId: string): boolean;

    /** Get total mention count across all guilds */
    getTotalMentionCount(excludeDefaultGuild?: boolean): number;

    /** Get total notification center mention count */
    getTotalNotificationsMentionCount(excludeDefaultGuild?: boolean): number;

    /** Get mention count for private channels */
    getPrivateChannelMentionCount(): number;

    /** Get mention count for a specific private channel */
    getMentionCountForPrivateChannel(channelId: string): GuildReadStateStore.MentionCount | undefined;

    /** Get change sentinel for a specific guild */
    getGuildChangeSentinel(guildId: string): number;
}
