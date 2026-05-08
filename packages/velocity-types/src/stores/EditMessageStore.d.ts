import { FluxStore } from "..";

export class EditMessageStore extends FluxStore {
    /** Check if a specific message is being edited */
    isEditing(channelId: string, messageId: string): boolean;

    /** Check if any message in a channel is being edited */
    isEditingAny(channelId: string): boolean;

    /** Get the text value being edited in a channel */
    getEditingTextValue(channelId: string): string | undefined;

    /** Get the rich value being edited in a channel */
    getEditingRichValue(channelId: string): any | undefined;

    /** Get the ID of the message being edited in a channel */
    getEditingMessageId(channelId: string): string | undefined;

    /** Get the message object being edited in a channel */
    getEditingMessage(channelId: string): any | null;

    /** Get the action source for the edit */
    getEditActionSource(channelId: string): string | undefined;
}
