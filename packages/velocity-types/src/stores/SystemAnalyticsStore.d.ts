import { FluxStore } from "..";

export namespace SystemAnalyticsStore {
    export interface State {
        hashes: Record<string, string>;
    }

    export interface SystemInfo {
        gpus?: any[];
        [key: string]: any;
    }
}

export class SystemAnalyticsStore extends FluxStore {
    /** Get current state */
    getState(): SystemAnalyticsStore.State;

    /** Get system info */
    info(): Promise<SystemAnalyticsStore.SystemInfo | null>;
}

export function getSystemInfo(): Promise<SystemAnalyticsStore.SystemInfo | null>;
