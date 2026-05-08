import { FluxStore, User } from "..";

export namespace RTCConnectionDesyncStore {
    export interface VoiceState {
        userId: string;
        channelId: string;
        [key: string]: any;
    }

    export interface Participant {
        type: string;
        user: User;
        id: string;
        streamId: string | null;
        voiceState: VoiceState;
        voicePlatform: string | null;
        speaking: boolean;
        latched: boolean;
        lastSpoke: number;
        soundsharing: boolean;
        ringing: boolean;
        userNick: string;
        userAvatarDecoration: any;
        localVideoDisabled: boolean;
        isPoppedOut: boolean;
    }
}

export class RTCConnectionDesyncStore extends FluxStore {
    /** Get the count of desynced voice states */
    get desyncedVoiceStatesCount(): number;

    /** Get all desynced user IDs */
    getDesyncedUserIds(): string[];

    /** Get all desynced voice states */
    getDesyncedVoiceStates(): RTCConnectionDesyncStore.VoiceState[];

    /** Get all desynced participants */
    getDesyncedParticipants(): RTCConnectionDesyncStore.Participant[];
}
