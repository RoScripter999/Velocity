import { FluxStore } from "..";

export namespace GuildStickersStore {
    export interface GuildSticker {
        id: string;
        tags: string;
        type: number;
        name: string;
        description: string;
        format_type: number;
        guild_id: string;
        available: boolean;
        version: number;
        user_id?: string;
    }

    export interface State {
        [guildId: string]: {
            [stickerId: string]: GuildSticker;
        };
    }
}

export class GuildStickersStore extends FluxStore {
    /** Get all stickers organized by guild ID */
    getAllGuildStickers(state: any): Map<string, GuildStickersStore.GuildSticker[]>;

    /** Get stickers for a specific guild */
    getStickersByGuildId(guildId: string, state?: any): GuildStickersStore.GuildSticker[];

    /** Get metadata for all stickers (searchable fields) */
    getStickerMetadataMap(state: any): Map<string, any[]>;

    /** Get a sticker by its ID */
    getStickerById(stickerId: string): GuildStickersStore.GuildSticker | undefined;
}
