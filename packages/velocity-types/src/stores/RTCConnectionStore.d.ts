import { FluxStore } from "..";

export namespace RTCConnectionStore {
    export interface RTCConnectionState {
        duration: number;
        mediaSessionId: string | null;
        rtcConnectionId: string | null;
        wasEverMultiParticipant: boolean;
        wasEverRtcConnected: boolean;
        voiceStateAnalytics: any;
        channelId: string;
    }

    export interface PingStats {
        pings: number[];
        quality: string;
    }

    export interface PacketStats {
        [key: string]: any;
    }

    export interface SecureFramesState {
        [key: string]: any;
    }
}

export class RTCConnectionStore extends FluxStore {
    /** Get the current RTC connection instance */
    getRTCConnection(): any;

    /** Get the current RTC connection state */
    getState(): string;

    /** Check if currently connected to RTC */
    isConnected(): boolean;

    /** Check if currently disconnected from RTC */
    isDisconnected(): boolean;

    /** Get the voice channel ID for remote disconnect */
    getRemoteDisconnectVoiceChannelId(): string | null;

    /** Get the voice channel ID from the last session */
    getLastSessionVoiceChannelId(): string | null;

    /** Set the voice channel ID from the last session */
    setLastSessionVoiceChannelId(channelId: string): void;

    /** Get the guild ID of the current connection */
    getGuildId(): string | undefined;

    /** Get the channel ID of the current connection */
    getChannelId(): string | undefined;

    /** Get the RTC hostname */
    getHostname(): string;

    /** Get the current connection quality */
    getQuality(): string;

    /** Get array of recent ping values */
    getPings(): number[];

    /** Get the average ping */
    getAveragePing(): number;

    /** Get the last recorded ping */
    getLastPing(): number | undefined;

    /** Get the outbound packet loss rate */
    getOutboundLossRate(): number | undefined;

    /** Get the media session ID */
    getMediaSessionId(): string | undefined;

    /** Get the RTC connection ID */
    getRTCConnectionId(): string | undefined;

    /** Get the connection duration in milliseconds */
    getDuration(): number | null;

    /** Get the state from the last RTC connection */
    getLastRTCConnectionState(): RTCConnectionStore.RTCConnectionState | null;

    /** Get voice filter speaking duration in milliseconds */
    getVoiceFilterSpeakingDurationMs(): number | undefined;

    /** Get packet statistics */
    getPacketStats(): RTCConnectionStore.PacketStats | undefined;

    /** Get voice state statistics */
    getVoiceStateStats(): any;

    /** Get user-specific voice settings statistics */
    getUserVoiceSettingsStats(userId: string): any;

    /** Check if connection ever had multiple participants */
    getWasEverMultiParticipant(): boolean;

    /** Check if connection was ever successfully established */
    getWasEverRtcConnected(): boolean;

    /** Get all connected user IDs */
    getUserIds(): string[] | undefined;

    /** Get the current join voice ID */
    getJoinVoiceId(): string | null;

    /** Check if a specific user is connected */
    isUserConnected(userId: string): boolean | undefined;

    /** Get secure frames encryption state */
    getSecureFramesState(): RTCConnectionStore.SecureFramesState | undefined;

    /** Get secure frames roster map entry for a user */
    getSecureFramesRosterMapEntry(userId: string): any;

    /** Get the last time non-zero remote video sink wants were received */
    getLastNonZeroRemoteVideoSinkWantsTime(): number;

    /** Check if user was moved to a different channel */
    getWasMoved(): boolean;
}
