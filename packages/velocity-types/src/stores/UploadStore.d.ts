import { FluxStore } from "..";

export namespace UploadStore {
    export interface UploadFile {
        id: string;
        filename: string;
        size?: number;
        progress?: number;
        isImage?: boolean;
        isVideo?: boolean;
        isAudio?: boolean;
        width?: number;
        height?: number;
        duration?: number;
        mimeType?: string;
        items?: any[];
        spoiler?: boolean;
        file?: File;
    }

    export interface UploadMessage {
        id: string;
        nonce?: string;
        [key: string]: any;
    }
}

export class UploadStore extends FluxStore {
    getFiles(channelId: string): UploadStore.UploadFile[];
    getMessageForFile(fileId: string): UploadStore.UploadMessage | undefined;
    getUploaderFileForMessageId(messageId: string): UploadStore.UploadFile | undefined;
    getUploadAttachments(channelId?: string): any | undefined;
}
