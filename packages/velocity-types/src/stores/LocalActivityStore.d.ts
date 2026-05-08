import { ActivityType } from "@velocity-types/enums";
import { FluxStore } from "..";

export namespace LocalActivityStore {
    export interface Activity {
        type: string | ActivityType;
        name?: string;
        application_id?: string;
        state?: string;
        details?: string;
        timestamps?: {
            start?: number;
            end?: number;
        };
        emoji?: {
            name: string;
            id?: string;
        };
        flags?: number;
        platform?: string;
        [key: string]: any;
    }
}

export class LocalActivityStore extends FluxStore {
    /** Get all local activities (games, streaming, custom status, etc.) */
    getActivities(): LocalActivityStore.Activity[];

    /** Get the primary/first activity */
    getPrimaryActivity(): LocalActivityStore.Activity | undefined;

    /** Get activity for a specific application ID */
    getApplicationActivity(applicationId: string): LocalActivityStore.Activity | undefined;

    /** Get custom status activity */
    getCustomStatusActivity(): LocalActivityStore.Activity | undefined;

    /** Find activity matching a predicate */
    findActivity(predicate: (activity: LocalActivityStore.Activity) => boolean): LocalActivityStore.Activity | undefined;

    /** Get all application activities by socket ID */
    getApplicationActivities(): Record<string, [number, LocalActivityStore.Activity, any]>;

    /** Get activity for a specific process ID */
    getActivityForPID(pid: number): LocalActivityStore.Activity | null;
}
