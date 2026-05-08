import { FluxStore } from "..";

export namespace LaunchableGameStore {
    export interface State {
        launchingGames: Set<string>;
        launchableGames: Record<string, boolean>;
    }
}

export class LaunchableGameStore extends FluxStore {
    /** Get set of game IDs currently launching */
    get launchingGames(): Set<string>;

    /** Get map of game IDs to launchability status */
    get launchableGames(): Record<string, boolean>;

    /** Check if a game is launchable */
    isLaunchable(gameId: string): boolean;
}
