import { FluxStore } from "..";

export namespace DimensionStore {
    export interface ChannelDimensions {
        channelId: string;
        scrollTop: number;
        scrollHeight: number;
        offsetHeight: number;
    }

    export interface GuildDimensions {
        guildId: string;
        scrollTop: number | null;
        scrollTo: number | null;
    }

    export interface GuildListDimensions {
        scrollTop: number;
    }
}

export class DimensionStore extends FluxStore {
    /** Get percentage scrolled in a channel (0-1) */
    percentageScrolled(channelId: string): number;

    /** Get channel scroll dimensions */
    getChannelDimensions(channelId: string): DimensionStore.ChannelDimensions | undefined;

    /** Get guild list dimensions */
    getGuildDimensions(guildId: string): DimensionStore.GuildDimensions;

    /** Get guild list scroll dimensions */
    getGuildListDimensions(): DimensionStore.GuildListDimensions;

    /** Check if channel is scrolled to bottom */
    isAtBottom(channelId: string): boolean;
}
