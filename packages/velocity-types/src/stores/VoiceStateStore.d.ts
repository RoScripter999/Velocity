import { DiscordRecord } from "../common";
import { FluxStore } from "./FluxStore";

export type UserVoiceStateRecords = Record<string, VoiceStateStore.VoiceState>;
export type VoiceStates = Record<string, UserVoiceStateRecords>;

export namespace VoiceStateStore {
    export interface VoiceState extends DiscordRecord {
        userId: string;
        channelId: string | null | undefined;
        sessionId: string | null | undefined;
        mute: boolean;
        deaf: boolean;
        selfMute: boolean;
        selfDeaf: boolean;
        selfVideo: boolean;
        selfStream: boolean | undefined;
        suppress: boolean;
        requestToSpeakTimestamp: string | null | undefined;
        discoverable: boolean;

        isVoiceMuted(): boolean;
        isVoiceDeafened(): boolean;
    }
}

export class VoiceStateStore extends FluxStore {
    getAllVoiceStates(): VoiceStates;
    getVoiceStateVersion(): number;

    getVoiceStates(guildId?: string | null): UserVoiceStateRecords;
    getVoiceStatesForChannel(channelId: string): UserVoiceStateRecords;
    getVideoVoiceStatesForChannel(channelId: string): UserVoiceStateRecords;

    getVoiceState(guildId: string | null, userId: string): VoiceStateStore.VoiceState | undefined;
    getDiscoverableVoiceState(guildId: string | null, userId: string): VoiceStateStore.VoiceState | null;
    getUserVoiceChannelId(guildId: string | null, userId: string): string | undefined;
    getVoiceStateForChannel(channelId: string, userId?: string): VoiceStateStore.VoiceState | undefined;
    getVoiceStateForUser(userId: string): VoiceStateStore.VoiceState | undefined;
    getDiscoverableVoiceStateForUser(userId: string): VoiceStateStore.VoiceState | undefined;
    getVoiceStateForSession(userId: string, sessionId?: string): VoiceStateStore.VoiceState | undefined;

    getCurrentClientVoiceChannelId(guildId: string | null): string | undefined;
    isCurrentClientInVoiceChannel(): boolean;

    isInChannel(channelId: string, userId?: string): boolean;
    hasVideo(channelId: string): boolean;
    getUsersWithVideo(channelId: string): Set<string>;
    getVoicePlatformForChannel(channelId: string, userId: string): string;

    get userHasBeenMovedVersion(): number;
}
