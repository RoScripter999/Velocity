import { FluxStore } from "..";

export enum ChannelListUnreadsMode {
    HIDDEN = "hidden",
    UNREAD = "unread",
    MENTIONS = "mentions",
    VOICE_CHANNELS = "voice-channels",
}

export namespace ChannelListUnreadsStore {
    export interface UnreadState {
        topBar: BarState;
        bottomBar: BarState;
    }

    interface BarState {
        mode: ChannelListUnreadsMode;
        mentionCount: number;
        targetChannelId: string | null;
    }
}

export class ChannelListUnreadsStore extends FluxStore {
    getUnreadStateForGuildId(guildId: string): ChannelListUnreadsStore.UnreadState;
}
