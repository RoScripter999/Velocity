import { FluxStore, Message } from "..";
import { ReferencedMessageState } from "../../enums";

export namespace ReferencedMessageStore {
    export interface MessageReference {
        channel_id: string;
        message_id: string;
        guild_id?: string;
    }

    export interface CachedMessage {
        state: ReferencedMessageState;
        message?: Message;
    }
}

export class ReferencedMessageStore extends FluxStore {
    /** Get message by reference */
    getMessageByReference(reference: ReferencedMessageStore.MessageReference | null): ReferencedMessageStore.CachedMessage;

    /** Get message by channel and message ID */
    getMessage(channelId: string, messageId: string): ReferencedMessageStore.CachedMessage;

    /** Get reply IDs for a channel */
    getReplyIdsForChannel(channelId: string): Set<string>;
}
