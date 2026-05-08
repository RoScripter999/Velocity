import { FluxStore } from "..";

export namespace DispatchManagerStore {
    export interface ApplicationIdentifier {
        applicationId: string;
        branchId: string;
    }
}

export class DispatchManagerStore extends FluxStore {
    /** Get active queue items */
    get activeItems(): DispatchManagerStore.ApplicationIdentifier[];

    /** Get finished queue items */
    get finishedItems(): DispatchManagerStore.ApplicationIdentifier[];

    /** Check if queue is paused */
    get paused(): boolean;

    /** Get queue position for an application */
    getQueuePosition(applicationId: string, branchId: string): number;

    /** Check if installation is corrupt */
    isCorruptInstallation(): boolean;
}
