import { Channel, FluxStore } from "..";

export namespace StageChannelParticipantStore {
    export interface Participant {
        userId: string;
        [key: string]: any;
    }

    export interface RequestToSpeakParticipant extends Participant {
        timestamp: number;
    }

    export interface State {
        [channelId: string]: {
            participants: Participant[];
            requestToSpeakParticipants: RequestToSpeakParticipant[];
            version: number;
        };
    }
}

export class StageChannelParticipantStore extends FluxStore {
    /** Get the version number for participants in a stage channel (returns -1 if not found) */
    getParticipantsVersion(channelId: string): number;

    /** Get mutable array of participants in a stage channel */
    getMutableParticipants(channelId: string, filter?: (p: StageChannelParticipantStore.Participant) => boolean): StageChannelParticipantStore.Participant[];

    /** Get participants requesting to speak in a stage channel */
    getMutableRequestToSpeakParticipants(channelId: string): StageChannelParticipantStore.RequestToSpeakParticipant[];

    /** Get the version number for request to speak participants */
    getRequestToSpeakParticipantsVersion(channelId: string): number;

    /** Get count of participants in a stage channel */
    getParticipantCount(channelId: string, filter?: (p: StageChannelParticipantStore.Participant) => boolean): number;

    /** Get all stage voice channels for a guild */
    getChannels(guildId?: string): Channel[];

    /** Get the version number for channels */
    getChannelsVersion(): number;

    /** Get a specific participant by user ID */
    getParticipant(channelId: string, userId: string): StageChannelParticipantStore.Participant | null;
}
