import { FluxStore } from "..";

export enum BuildOverrideState {
    NotResolved = 0,
    Resolving = 1,
    Resolved = 2,
    Invalid = 3
}

export namespace BuildOverrideStore {
    export interface BuildOverride {
        url: string | undefined;
        state: BuildOverrideState;
    }

    export interface CurrentBuildOverride {
        state: BuildOverrideState;
        overrides: Record<string, unknown>;
    }
}

export class BuildOverrideStore extends FluxStore {
    getCurrentBuildOverride(): BuildOverrideStore.CurrentBuildOverride;
    getBuildOverride(url: string): BuildOverrideStore.BuildOverride | undefined;
    getBuildOverrides(): Record<string, BuildOverrideStore.BuildOverride>;
}
