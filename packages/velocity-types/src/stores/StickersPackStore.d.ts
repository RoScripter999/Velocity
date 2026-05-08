import { FluxStore } from "..";

export namespace StickersPackStore {
    export interface PackSticker {
        id: string;
        tags: string[];
        type: number;
        name: string;
        description: string;
        format_type: number;
        pack_id: string;
    }

    export interface StickerPack {
        id: string;
        name: string;
        stickers: PackSticker[];
    }

    export interface State {
        [packId: string]: {
            [stickerId: string]: PackSticker;
        };
    }
}

export class StickersPackStore extends FluxStore {
    /** Check if sticker packs are currently being fetched */
    get isFetchingStickerPacks(): boolean;

    /** Check if sticker packs have been loaded */
    get hasLoadedStickerPacks(): boolean;

    /** Check if a pack is a premium pack */
    isPremiumPack(packId: string): boolean;

    /** Get a sticker pack by ID */
    getStickerPack(packId: string): StickersPackStore.StickerPack | undefined;

    /** Get all stickers organized by pack ID */
    getAllPackStickers(state: any): Map<string, StickersPackStore.PackSticker[]>;

    /** Get metadata for all stickers (searchable fields) */
    getStickerMetadataMap(state: any): Map<string, any[]>;

    /** Get a sticker by its ID */
    getStickerById(stickerId: string): StickersPackStore.PackSticker | undefined;

    /** Get all premium packs */
    getPremiumPacks(state: any): StickersPackStore.StickerPack[];
}
