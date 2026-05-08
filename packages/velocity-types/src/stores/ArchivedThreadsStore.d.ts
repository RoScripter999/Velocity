import { FluxStore } from "..";

export enum ArchivedThreadsSortOrder {
    LATEST_ACTIVITY = 0,
}

export enum ArchivedThreadsTagSetting {
    MATCH_SOME = 0,
    MATCH_ALL = 1,
}

export namespace ArchivedThreadsStore {
    export interface LoadArchivedThreadsPayload {
        channelId: string;
        sortOrder: number;
        tagFilter: Set<string> | string[];
        tagSetting: number;
    }

    export interface LoadArchivedThreadsSuccessPayload {
        channelId: string;
        sortOrder: number;
        tagFilter: Set<string>;
        tagSetting: number;
        threads: any[];
        hasMore: boolean;
        offset: number;
    }
}

export class ArchivedThreadsStore extends FluxStore {
    get canLoadMore(): boolean;
    get nextOffset(): number;
    get isInitialLoad(): boolean;
    isLoading(channelId: string, sortOrder: number, tagFilter: Set<string>, tagSetting: number): boolean;
    getThreads(channelId: string, sortOrder: number, tagFilter: Set<string>, tagSetting: number): string[];
}
