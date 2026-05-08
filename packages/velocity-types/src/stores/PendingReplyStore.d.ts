import { FluxStore, Channel, Message } from "..";

export namespace PendingReplyStore {
    export interface PendingReply {
        /* Prob wrong but too lazy to do it */
        channel: Channel;
        message: Message;
        shouldMention: boolean;
        showMentionToggle: boolean;
    }

    export interface ShallowPendingReply {
        channelId: string;
        messageId: string;
        shouldMention: boolean;
        showMentionToggle: boolean;
    }

    export interface State {
        [channelId: string]: ShallowPendingReply;
    }
}

export class PendingReplyStore extends FluxStore {
    /** Get current state */
    getState(): PendingReplyStore.State;

    /** Get pending reply for a channel */
    getPendingReply(channelId: string): PendingReplyStore.PendingReply | undefined;

    /** Get the action source for a pending reply */
    getPendingReplyActionSource(channelId: string): string | undefined;
}
