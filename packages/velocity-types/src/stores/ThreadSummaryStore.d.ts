import { FluxStore } from "..";

export namespace ThreadSummaryStore {
    export interface State {
        isInProgress: boolean;
    }
}

export class ThreadSummaryStore extends FluxStore {
    /** Check if thread summarization is currently in progress */
    isInProgress(): boolean;
}
