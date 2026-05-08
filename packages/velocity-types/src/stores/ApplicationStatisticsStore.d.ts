import { FluxStore } from "..";

export namespace ApplicationStatisticsStore {
    export interface Statistics {
        [key: string]: any;
    }
}

export class ApplicationStatisticsStore extends FluxStore {
    getStatisticsForApplication(applicationId: string): ApplicationStatisticsStore.Statistics | undefined;
    shouldFetchStatisticsForApplication(applicationId: string): boolean;
}
