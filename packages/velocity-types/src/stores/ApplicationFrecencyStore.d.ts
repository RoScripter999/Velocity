import { FluxStore } from "..";
import { FrecencyStore } from "..";

export namespace ApplicationFrecencyStore {
    export enum CommandTypes {
        CHAT = 1,
        PRIMARY_ENTRY_POINT = 2
    }

    export interface PendingUsage {
        key: string;
        timestamp: number;
    }

    export interface ApplicationFrecency {
        recentUses: number[];
        // Score calculation based on recent usage patterns
        score?: number;
    }
}

export class ApplicationFrecencyStore extends FluxStore {
    getState(): ApplicationFrecencyStore.PendingUsage[];
    hasPendingUsage(): boolean;
    getApplicationFrecencyWithoutLoadingLatest(): FrecencyStore;
    getScoreWithoutLoadingLatest(applicationId: string): number;
    getTopApplicationsWithoutLoadingLatest(): Record<string, ApplicationFrecency>;
}
