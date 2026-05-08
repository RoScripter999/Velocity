import { FluxStore } from "..";

export namespace PrivateChannelSortStore {
    export interface SortedChannel {
        channelId: string;
        lastMessageId: string;
        isFavorite: boolean;
        isRequest: boolean;
    }
}

export class PrivateChannelSortStore extends FluxStore {
    getPrivateChannelIds(): string[];
    getSortedChannels(): Array<PrivateChannelSortStore.SortedChannel[]>;
    serializeForOverlay(): Record<string, string>;
}
