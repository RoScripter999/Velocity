import { FluxStore } from "..";

export enum AutoUpdateState {
    CHECKING_FOR_UPDATES = "CHECKING_FOR_UPDATES",
    UPDATE_NOT_AVAILABLE = "UPDATE_NOT_AVAILABLE",
    UPDATE_AVAILABLE = "UPDATE_AVAILABLE",
    UPDATE_MANUALLY = "UPDATE_MANUALLY",
    UPDATE_ERROR = "UPDATE_ERROR",
    UPDATE_DOWNLOADED = "UPDATE_DOWNLOADED",
}

export class AutoUpdateStore extends FluxStore {
    getState(): AutoUpdateState;
}
