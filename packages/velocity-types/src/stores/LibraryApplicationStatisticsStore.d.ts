import { FluxStore } from "..";

export namespace LibraryApplicationStatisticsStore {
    export interface ApplicationStatistic {
        application_id: string;
        total_duration: number;
        last_played_at: string;
        total_discord_sku_duration?: number;
    }
}

export class LibraryApplicationStatisticsStore extends FluxStore {
    get applicationStatistics(): Record<string, LibraryApplicationStatisticsStore.ApplicationStatistic>;
    get lastFetched(): number | null;
    getGameDuration(applicationId: string): number;
    getLastPlayedDateTime(applicationId: string): number | null;
    hasApplicationStatistic(applicationId: string): boolean;
    getCurrentUserStatisticsForApplication(applicationId: string): LibraryApplicationStatisticsStore.ApplicationStatistic | undefined;
    getQuickSwitcherScoreForApplication(applicationId: string): number;
}
