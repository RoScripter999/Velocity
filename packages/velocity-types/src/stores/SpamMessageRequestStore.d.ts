import { FluxStore } from "..";

export class SpamMessageRequestStore extends FluxStore {
    /** Load cache */
    loadCache(): void;

    /** Take snapshot */
    takeSnapshot(): { version: number; data: string[]; };

    /** Get all spam channel IDs */
    getSpamChannelIds(): Set<string>;

    /** Get count of spam channels */
    getSpamChannelsCount(): number;

    /** Check if a channel is spam */
    isSpam(channelId: string): boolean;

    /** Check if optimistically accepted */
    isAcceptedOptimistic(channelId: string): boolean;

    /** Check if store is ready */
    isReady(): boolean;
}
