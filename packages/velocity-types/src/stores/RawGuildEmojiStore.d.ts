import { FluxStore } from "..";

export namespace RawGuildEmojiStore {
    export interface GuildEmoji {
        [symbol: string]: string; // RawGuildEmoji type symbol
        guildId: string;
        id: string;
        animated: boolean;
        name: string;
        require_colons: boolean;
        available: boolean;
        roles: string[];
        managed: boolean;
        version?: number;
        type: number;
    }

    export interface State {
        [guildId: string]: {
            [emojiId: string]: GuildEmoji;
        };
    }
}

export class RawGuildEmojiStore extends FluxStore {
    /** Get all emojis for a guild */
    getGuildEmojis(guildId: string): Record<string, RawGuildEmojiStore.GuildEmoji> | null;
}
