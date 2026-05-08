import { FluxStore } from "..";

export namespace FavoriteStore {
    export interface FavoriteChannel {
        id: string;
        nickname: string | null;
        type: number;
        order: number;
        parentId?: string | null;
    }
}

export class FavoriteStore extends FluxStore {
    getFavoriteChannels(): Record<string, FavoriteStore.FavoriteChannel>;
    get favoriteServerMuted(): boolean;
    isFavorite(channelId: string | null): boolean;
    getFavorite(channelId: string): FavoriteStore.FavoriteChannel | undefined;
    getCategoryRecord(channelId: string): any;
    getNickname(channelId: string): string | undefined;
}
