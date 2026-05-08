import { FluxStore } from "..";

export namespace StageChannelRoleStore {
    export interface StagePermissions {
        speaker: boolean;
        moderator: boolean | null;
    }

    export interface State {
        [channelId: string]: {
            [userId: string]: StagePermissions;
        };
    }
}

export class StageChannelRoleStore extends FluxStore {
    /** Check if user is a speaker in a stage channel */
    isSpeaker(userId: string, channelId: string): boolean;

    /** Check if user is a moderator in a stage channel */
    isModerator(userId: string, channelId: string): boolean;

    /** Check if user is an audience member (not speaker or moderator) */
    isAudienceMember(userId: string, channelId: string): boolean;

    /** Get stage permissions for a user in a channel */
    getPermissionsForUser(userId: string, channelId: string, checkModerator?: boolean): StageChannelRoleStore.StagePermissions;
}
