import { FluxStore } from "..";

export class PermissionSpeakStore extends FluxStore {
    /** Check if current voice channel is the guild's AFK channel */
    isAFKChannel(): boolean;

    /** Check if suppress warning should be shown */
    shouldShowWarning(): boolean;
}
