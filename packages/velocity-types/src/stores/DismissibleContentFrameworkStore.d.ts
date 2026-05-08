import { FluxStore } from "..";

export namespace DismissibleContentFrameworkStore {
    export interface State {
        numberOfDCsShownToday: number;
        dailyCapPeriodStart: number | null;
        dismissibleContentSeenDuringSession: Set<string>;
        dailyCapOverridden: boolean;
        newUserMinAgeRequiredOverridden: boolean;
        renderedAtTimestamps: Map<string, number>;
        lastDCDismissed: string | null;
        seenForGuildId: Map<string, Set<string>>;
    }
}

export class DismissibleContentFrameworkStore extends FluxStore {
    /** Get current state */
    getState(): DismissibleContentFrameworkStore.State;

    /** Check if daily cap is overridden */
    get dailyCapOverridden(): boolean;

    /** Check if new user min age requirement is overridden */
    get newUserMinAgeRequiredOverridden(): boolean;

    /** Get the last dismissed dismissible content */
    get lastDCDismissed(): string | null;

    /** Get when a dismissible content was rendered */
    getRenderedAtTimestamp(dismissibleContent: string): number | undefined;

    /** Check if user has hit the daily cap for dismissible content */
    hasUserHitDCCap(dismissibleContent?: string, guildId?: string): boolean;
}
