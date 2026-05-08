import { FluxStore } from "..";

export namespace DispatchApplicationLaunchSetupStore {
    export interface Progress {
        progress: number;
        total: number;
        name: string;
    }
}

export class DispatchApplicationLaunchSetupStore extends FluxStore {
    /** Get last progress update */
    getLastProgress(): DispatchApplicationLaunchSetupStore.Progress | null;

    /** Check if setup is running */
    isRunning(): boolean;
}
