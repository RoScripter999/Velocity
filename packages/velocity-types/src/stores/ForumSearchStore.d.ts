import { FluxStore } from "..";

export class ForumSearchStore extends FluxStore {
    /** Get the current search query for a forum channel */
    getSearchQuery(channelId: string): string | undefined;

    /** Check if search is currently loading for a forum channel */
    getSearchLoading(channelId: string): boolean;

    /** Get search results (thread IDs) for a forum channel */
    getSearchResults(channelId: string): string[] | undefined;

    /** Check if a forum channel has search results */
    getHasSearchResults(channelId: string): boolean;
}
