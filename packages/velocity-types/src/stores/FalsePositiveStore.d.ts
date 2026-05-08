import { FluxStore, MessageAttachment } from "..";

export namespace FalsePositiveStore {
    export interface FpMessageInfo {
        messageId: string;
        channelId: string;
        attachments: MessageAttachment[];
        reportSubmit: boolean;
    }
}

export class FalsePositiveStore extends FluxStore {
    /** Get false positive message info by message ID */
    getFpMessageInfo(messageId: string): FalsePositiveStore.FpMessageInfo | undefined;

    /** Get all false positive info for a channel */
    getChannelFpInfo(channelId: string): FalsePositiveStore.FpMessageInfo[];

    /** Check if a false positive report can be submitted for a message */
    canSubmitFpReport(messageId: string): boolean;

    /** Get the valid content scan version (considers feature flags) */
    get validContentScanVersion(): number;
}
