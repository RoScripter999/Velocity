import { FluxStore } from "..";

export namespace SortedVoiceStateStore {
    export interface VoiceStateUser {
        voiceState: any;
        user: any;
        member?: any;
        comparator: string;
        nick?: string;
        connectedOn: number;
        _isPlaceholder?: boolean;
    }
}

export class SortedVoiceStateStore extends FluxStore {
    /** Get all voice states for a guild */
    getVoiceStates(guildId?: string): SortedVoiceStateStore.VoiceStateUser[];

    /** Get all voice states for all guilds */
    getAllVoiceStates(): Record<string, any>;

    /** Get voice states for a channel */
    getVoiceStatesForChannel(channel: any): SortedVoiceStateStore.VoiceStateUser[];

    /** Get voice states for a channel (alt method) */
    getVoiceStatesForChannelAlt(channelId: string, guildId?: string): SortedVoiceStateStore.VoiceStateUser[];

    /** Count voice states in a channel */
    countVoiceStatesForChannel(channelId: string): number;

    /** Get voice state version for a guild */
    getVoiceStateVersion(guildId?: string): number;
}
