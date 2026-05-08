import { FluxStore } from "..";

export namespace RunningGameStore {
    export interface Game {
        pid: number;
        exePath: string;
        cmdLine: string;
        lastFocused: number;
        id?: string;
        nativeProcessObserverId?: string;
        name?: string;
        add?: boolean;
        block?: boolean;
        distributor?: string;
        gameName?: string;
        lastLaunched?: number;
        start?: number;
    }

    export interface ProcessOverride {
        exePath: string;
        cmdLine: string;
        lastFocused: number;
        id?: string;
        nativeProcessObserverId?: string;
        name?: string;
        add?: boolean;
        block?: boolean;
        distributor?: string;
        gameName?: string;
        lastLaunched?: number;
    }
}

export class RunningGameStore extends FluxStore {
    getRunningGames(): RunningGameStore.Game[];
    getGameForPID(pid: number): RunningGameStore.Game | null;
    getGameForName(name: string): RunningGameStore.Game | null;
    getGameOrTransformedSubgameForPID(pid: number): RunningGameStore.Game | null;
    getRunningVerifiedApplicationIds(): string[];
    getGamesSeen(excludeCurrentGame?: boolean, shouldSort?: boolean): RunningGameStore.Game[];
    getSeenGameByName(name: string): RunningGameStore.Game | null;
    isObservedAppRunning(appName: string): boolean;
    getOverrides(): RunningGameStore.Game[];
    getOverrideForGame(game: RunningGameStore.Game): RunningGameStore.Game | null;
    getOverlayEnabledForGame(game: RunningGameStore.Game): boolean;
    getGameOverlayStatus(game: RunningGameStore.Game): any;
    getVisibleGame(): RunningGameStore.Game | null;
    getVisibleRunningGames(): RunningGameStore.Game[];
    isDetectionEnabled(game: RunningGameStore.Game): boolean;
}
