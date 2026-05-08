import { FluxStore } from "..";

export namespace StickersStore {
    export interface Sticker {
        id: string;
        tags: string;
        type: number;
        name: string;
        description: string;
        format_type: number;
        pack_id?: string;
        guild_id?: string;
        available?: boolean;
        version?: number;
        user_id?: string;
    }

    export interface StickerPack {
        id: string;
        stickers: Sticker[];
        name: string;
        sku_id?: string;
        description?: string;
        cover_sticker_id?: string;
        banner_asset_id?: string;
    }

    export interface StickerMetadata {
        type: number;
        value: string | number;
    }
}

export class StickersStore extends FluxStore {
    get isLoaded(): boolean;
    get loadState(): number;
    getStickerMetadataArrays(): Array<Map<string, StickersStore.StickerMetadata[]>>;
    get hasLoadedStickerPacks(): boolean;
    get isFetchingStickerPacks(): boolean;
    getStickerById(stickerId: string): StickersStore.Sticker | undefined;
    getStickerPack(packId: string): StickersStore.StickerPack | undefined;
    getPremiumPacks(): StickersStore.StickerPack[];
    isPremiumPack(packId: string): boolean;
    getRawStickersByGuild(): Map<string, StickersStore.Sticker[]>;
    getAllGuildStickers(): Map<string, StickersStore.Sticker[]>;
    getAllPackStickers(): Map<string, StickersStore.Sticker[]>;
    getStickersByGuildId(guildId: string): StickersStore.Sticker[] | undefined;
}
