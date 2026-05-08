import { FluxStore } from "..";

export namespace TopEmojiStore {
    export interface State {
        topEmojisByGuildId: Record<string, string[]>;
    }
}

export class TopEmojiStore extends FluxStore {
    /** Get current state */
    getState(): TopEmojiStore.State;

    /** Get top emoji IDs for a guild */
    getTopEmojiIdsByGuildId(guildId: string): string[] | undefined;

    /** Check if top emojis are currently being fetched for a guild */
    getIsFetching(guildId: string): boolean;
}
