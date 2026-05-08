import { FluxStore } from "..";

export namespace AppLauncherLastUsedCommandStore {
    export interface LastUsedCommandState {
        lastUsedCommandId: string | null;
        lastUsedTimeMs: number | null;
    }
}

export class AppLauncherLastUsedCommandStore extends FluxStore {
    getState(): AppLauncherLastUsedCommandStore.LastUsedCommandState;
    getLastUsedCommandId(): string | null;
}
