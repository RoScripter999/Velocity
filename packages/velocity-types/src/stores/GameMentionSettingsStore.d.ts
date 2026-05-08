import { FluxStore } from "..";

export namespace GameMentionSettingsStore {
    export interface State {
        [key: string]: any;
    }
}

export class GameMentionSettingsStore extends FluxStore {
    /** Get mute setting for a game */
    getMute(gameId: string): any;
}
