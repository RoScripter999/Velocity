import { FluxStore, Guild, Application, Channel, User } from "..";

export namespace QuickSwitcherStore {
    export interface SearchResult {
        // Prob wrong but too tired to search
        record: Channel | Guild | User | Application;
        channelId?: string;
    }

    export interface Props {
        theme: string;
        query: string;
        queryMode: string | null;
        results: SearchResult[];
        selectedIndex: number;
        seenTutorial: boolean;
        maxQueryLength: number;
    }

    export interface State {
        channelHistory: string[];
    }
}

export class QuickSwitcherStore extends FluxStore {
    /** Get current state */
    getState(): QuickSwitcherStore.State;

    /** Check if quick switcher is open */
    isOpen(): boolean;

    /** Get total count of results or results of specific type */
    getResultTotals(type?: string): number;

    /** Check if channel notice should be shown */
    channelNoticePredicate(channelId: string, timestamp: number): boolean;

    /** Get frequent guilds */
    getFrequentGuilds(): Guild[] | null;

    /** Get length of frequent guilds */
    getFrequentGuildsLength(): number;

    /** Get channel history */
    getChannelHistory(): string[];

    /** Get last time quick switcher was shown */
    getLastShowTimestamp(): number | null;

    /** Get all props for the quick switcher component */
    getProps(): QuickSwitcherStore.Props;
}
