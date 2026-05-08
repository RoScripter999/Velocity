import { FluxStore } from "..";

export namespace UploadAttachmentStore {
    export interface Upload {
        id: string;
        filename: string;
        description?: string;
        spoiler: boolean;
        isThumbnail?: boolean;
        isImage?: boolean;
        item: {
            file: File;
        };
        upload(): void;
        removeFromMsgDraft(): void;
    }
}

export class UploadAttachmentStore extends FluxStore {
    getFirstUpload(channelId: string, draftType: number): UploadAttachmentStore.Upload | null;
    hasAdditionalUploads(channelId: string, draftType: number): boolean;
    getUploads(channelId: string, draftType: number): UploadAttachmentStore.Upload[];
    getUploadCount(channelId: string, draftType: number): number;
    getUpload(channelId: string, uploadId: string, draftType: number): UploadAttachmentStore.Upload | undefined;
    findUpload(channelId: string, draftType: number, predicate: (upload: UploadAttachmentStore.Upload) => boolean): UploadAttachmentStore.Upload | undefined;
}
