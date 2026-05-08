import { FluxStore } from "..";

export namespace GameStore {
    export interface Executable {
        name: string;
        [key: string]: any;
    }

    export interface DetectableGame {
        id: string;
        name: string;
        executables: Executable[];
        overlay: boolean;
        overlayWarn: boolean;
        overlayCompatibilityHook: boolean;
        hook: boolean;
        aliases: string[];
        supportsOutOfProcessOverlay: boolean;
        themes: any[];
        icon?: string;
        thirdPartySkus: any[];
        cover_image_hash?: string;
    }

    export interface GameData {
        name?: string;
        exePath?: string;
        nativeProcessObserverId?: number;
    }

    export interface State {
        detectableGamesEtag: string;
        detectableGames: DetectableGame[];
    }
}

export class GameStore extends FluxStore {
    /** Get all detectable games */
    get games(): GameStore.DetectableGame[];

    /** Get a detectable game by ID */
    getDetectableGame(gameId: string): GameStore.DetectableGame | undefined;

    /** Get game by name */
    getGameByName(name: string): GameStore.DetectableGame | null;

    /** Get a game from an application */
    getOfficialGame(application: any): GameStore.DetectableGame | null;

    /** Get game from an application */
    getGameByApplication(application: any): GameStore.DetectableGame | null;

    /** Check if game is in database which i have no fuckin idea what it does */
    isGameInDatabase(game: any): boolean;

    /** Check if games are being fetched */
    get fetching(): boolean;

    /** Get current detectable games etag */
    get detectableGamesEtag(): string;

    /** Get timestamp of last fetch */
    get lastFetched(): number | null;

    /** Check if fetch has been attempted */
    get hasAttemptedFetch(): boolean;

    /** Get TTL for detectable games cache */
    get detectableGamesTtl(): number;

    /** Check if detectable games can be fetched */
    canFetchDetectableGames(): boolean;

    /** Get game by executable name */
    getGameByExecutable(executableName: string): GameStore.DetectableGame | undefined;

    /** Get game by game data */
    getGameByGameData(gameData: GameStore.GameData): GameStore.DetectableGame | null;

    /** Check if game should be reported */
    shouldReport(gameName: string): boolean;

    /** Mark game as reported */
    markGameReported(gameName: string): void;

    /** Get current state */
    getState(): GameStore.State;
}
