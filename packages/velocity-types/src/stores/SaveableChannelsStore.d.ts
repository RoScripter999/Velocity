import { FluxStore } from "..";

export namespace SaveableChannelsStore {
    export interface ChannelRecord {
        guildId: string | null;
        channelId: string;
        channelType: number;
        fallback?: boolean;
    }

    export interface Snapshot {
        version: number;
        data: {
            channels: ChannelRecord[];
            penalized: string[];
            lastChannel: ChannelRecord | null;
        };
    }

    export interface State {
        channels: Map<string, ChannelRecord>;
        penalized: Set<string>;
        lastChannel: ChannelRecord | null;
    }
}

export class SaveableChannelsStore extends FluxStore {
    /** Check if orphans can be evicted from cache */
    canEvictOrphans(): boolean;

    /** Get the save limit for a channel */
    saveLimit(channelId: string): number | null;

    /** Get all saveable channels */
    getSaveableChannels(): SaveableChannelsStore.ChannelRecord[];

    /** Take a snapshot of current state */
    takeSnapshot(): SaveableChannelsStore.Snapshot;

    /** Load cache from snapshot */
    loadCache(): void;
}
