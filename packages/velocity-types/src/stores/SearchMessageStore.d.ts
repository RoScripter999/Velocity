import { FluxStore } from "..";

export namespace SearchMessageStore {
    export interface Message {
        id: string;
        [key: string]: any;
    }

    export interface SearchState {
        isIndexing: boolean;
        isHistoricalIndexing: boolean;
        isFetching: boolean;
        analyticsId: string | null;
        error: any;
        messages: Message[] | null;
        documentsIndexed: number;
        totalResults: number | null;
        isInitialFetchComplete: boolean;
        cursor: string | null;
    }
}

export class SearchMessageStore extends FluxStore {
    /** Get a message by ID */
    getMessage(messageId: string): SearchMessageStore.Message | undefined;

    /** Get total count of results */
    getTotalCount(searchId: string): number | null;

    /** Check if initial fetch is complete */
    getIsInitialFetchComplete(searchId: string): boolean;

    /** Check if indexing */
    getIsIndexing(searchId: string): boolean;

    /** Check if doing historical indexing */
    getIsHistoricalIndexing(searchId: string): boolean;

    /** Get number of documents indexed */
    getDocumentsIndexed(searchId: string): number;

    /** Check if fetching */
    getIsFetching(searchId: string): boolean;

    /** Get search error */
    getError(searchId: string): any;

    /** Get all messages */
    getMessages(searchId: string): SearchMessageStore.Message[] | null;

    /** Get pagination cursor */
    getCursor(searchId: string): string | null;

    /** Get analytics ID */
    getAnalyticsId(searchId: string): string | null;

    /** Check if has search state */
    hasSearchState(searchId: string): boolean;
}
