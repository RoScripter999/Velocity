import { FluxStore } from "..";

export namespace FavoritesSuggestionStore {
    export interface State {
        suggestedChannels: Record<string, string[]>;
        dismissedSuggestions: Record<string, string[]>;
        channelOpensByChannelId: Record<string, number>;
    }
}

export class FavoritesSuggestionStore extends FluxStore {
    getSuggestedChannelId(guildId: string): string | null;
    getState(): FavoritesSuggestionStore.State;
}
