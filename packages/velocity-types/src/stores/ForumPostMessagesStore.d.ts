import { FluxStore, Message } from "..";

export namespace ForumPostMessagesStore {
    export interface ForumPostMessage {
        loaded: boolean;
        firstMessage: Message | null;
    }
}

export class ForumPostMessagesStore extends FluxStore {
    /** Check if the first message for a forum post is still loading */
    isLoading(channelId: string): boolean;

    /** Get the first message for a forum post channel */
    getMessage(channelId: string): ForumPostMessagesStore.ForumPostMessage;
}
