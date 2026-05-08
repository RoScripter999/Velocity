import { FluxStore, Message } from "..";

export enum ChannelPinsLoadState {
    LOADING = "LOADING",
    LOADED_HAS_MORE = "LOADED_HAS_MORE",
    LOADED_FINISHED = "LOADING_FINISHED",
    FAILED = "FAILED",
}

export namespace ChannelPinsStore {
    interface PinnedMessage {
        pinnedAt: Date;
        message: Message;
    }

    export interface PinsData {
        id: string;
        items: PinnedMessage[];
        state: ChannelPinsLoadState;
        guildId?: string;
    }
}

export class ChannelPinsStore extends FluxStore {
    getPins(channelId: string): ChannelPinsStore.PinsData | undefined;
}
