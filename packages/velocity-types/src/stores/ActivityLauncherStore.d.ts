import { FluxStore } from "..";

export enum ActivityLaunchState {
    LOADING = "LOADING",
    FAILED = "FAILED",
    COMPLETE = "COMPLETE"
}

export interface ActivityLauncherState {
    state: ActivityLaunchState;
    remotePartyId?: string;
}

export interface ActivityLauncherStates {
    [applicationId: string]: {
        [activityType: string]: ActivityLauncherState;
    };
}

export class ActivityLauncherStore extends FluxStore {
    getState(applicationId: string, activityType: string): ActivityLaunchState | undefined;
    getStates(): ActivityLauncherStates;
}
