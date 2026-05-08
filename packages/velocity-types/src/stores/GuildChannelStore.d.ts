import { FluxStore, Channel } from "..";

export interface ChannelRecord {
    channel: Channel;
    comparator: number;
}

export interface Channels {
    SELECTABLE: ChannelRecord[];
    VOCAL: ChannelRecord[];
    GUILD_CATEGORY: ChannelRecord[];
    count: number;
}

export interface TextChannelNameDisambiguations {
    [channelId: string]: {
        id: string;
        name: string;
    };
}

export class GuildChannelStore extends FluxStore {
    /** Get all guild channel structures */
    getAllGuilds(): Record<string, Channels | undefined>;

    /** Get channels for a guild */
    getChannels(guildId?: string, includeHidden?: boolean): Channels;

    /** Get first channel matching predicate and type */
    getFirstChannelOfType(guildId: string, predicate: (record: ChannelRecord) => boolean, type: string): Channel | null;

    /** Get first channel matching predicate */
    getFirstChannel(guildId: string, predicate: (record: ChannelRecord) => boolean, includeVocal?: boolean): Channel | null;

    /** Get default channel for a guild */
    getDefaultChannel(guildId: string, includeVocal?: boolean, permission?: number): Channel;

    /** Get default SFW (non-NSFW) channel for a guild */
    getSFWDefaultChannel(guildId: string, includeVocal?: boolean, permission?: number): Channel | null;

    /** Get all selectable channel IDs for a guild */
    getSelectableChannelIds(guildId: string): string[];

    /** Get all selectable channels for a guild */
    getSelectableChannels(guildId: string): ChannelRecord[];

    /** Get all vocal channel IDs for a guild */
    getVocalChannelIds(guildId: string): string[];

    /** Get all directory channel IDs for a guild */
    getDirectoryChannelIds(guildId: string): string[];

    /** Check if a guild has a selectable channel */
    hasSelectableChannel(guildId: string, channelId: string): boolean;

    /** Check if user has elevated permissions in a guild */
    hasElevatedPermissions(guildId: string): boolean;

    /** Check if guild has any channels */
    hasChannels(guildId: string): boolean;

    /** Check if guild has multiple categories */
    hasCategories(guildId: string): boolean;

    /** Get text channel name disambiguations for a guild */
    getTextChannelNameDisambiguations(guildId: string): TextChannelNameDisambiguations;
}
