import { FluxStore, Message, Channel } from "..";

export namespace InteractionStore {
    export interface InteractionData {
        channelId: string;
        interactionType: number;
        applicationId: string;
    }

    export interface QueuedInteraction {
        state: string;
        data: InteractionData;
        onCreate?: (interactionId: string) => void;
        onCancel?: () => void;
        onSuccess?: () => void;
        onFailure?: (errorCode: string, errorMessage: string, status: number, reasonCode: string) => void;
        errorCode?: string;
        errorMessage?: string;
    }

    export interface State {
        queuedInteractions: Record<string, QueuedInteraction>;
        nonces: Record<string, string>;
        messages: Record<string, string>;
        cleaned: Record<string, { insertedAt: number; nonce: string; messageId: string | null; interaction: QueuedInteraction; }>;
    }
}

export class InteractionStore extends FluxStore {
    /** Get interaction for a message */
    getInteraction(message: Message): InteractionStore.QueuedInteraction | null;

    /** Get all message interaction states */
    getMessageInteractionStates(): Record<string, string>;

    /** Check if an interaction can be queued */
    canQueueInteraction(messageId: string, nonce: string): boolean;

    /** Get the current IFrame modal application ID */
    getIFrameModalApplicationId(): string | undefined;

    /** Get the current IFrame modal key */
    getIFrameModalKey(): string | undefined;
}
