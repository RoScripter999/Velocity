import { FluxStore } from "..";

export namespace StickerMessagePreviewStore {
    export interface Sticker {
        [key: string]: any;
    }
}

export class StickerMessagePreviewStore extends FluxStore {
    /** Get sticker preview for a channel */
    getStickerPreview(channelId: string, draftType: number): StickerMessagePreviewStore.Sticker | undefined;
}
