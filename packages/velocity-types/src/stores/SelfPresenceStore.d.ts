import { FluxStore, LocalActivityStore } from "..";


export namespace SelfPresenceStore {
    export interface LocalPresence {
        status: string;
        since: number;
        activities: LocalActivityStore.Activity[];
        afk: boolean;
    }
}

export class SelfPresenceStore extends FluxStore {
    /** Get local presence */
    getLocalPresence(): SelfPresenceStore.LocalPresence;

    /** Get current status */
    getStatus(): string;

    /** Get activities */
    getActivities(includeFiltered?: boolean): LocalActivityStore.Activity[];

    /** Get unfiltered activities */
    getUnfilteredActivities(includeFiltered?: boolean): LocalActivityStore.Activity[];

    /** Get hidden activities */
    getHiddenActivities(): LocalActivityStore.Activity[];

    /** Get primary activity */
    getPrimaryActivity(includeFiltered?: boolean): LocalActivityStore.Activity | undefined;

    /** Get application activity */
    getApplicationActivity(applicationId: string, includeFiltered?: boolean): LocalActivityStore.Activity | undefined;

    /** Find activity by predicate */
    findActivity(predicate: (activity: LocalActivityStore.Activity) => boolean, includeFiltered?: boolean): LocalActivityStore.Activity | undefined;
}
