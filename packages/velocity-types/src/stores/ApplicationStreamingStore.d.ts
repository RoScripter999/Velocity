import { FluxStore } from "..";

export namespace ApplicationStreamingStore {
    export interface ApplicationStream {
        streamType: string;
        guildId: string | null;
        channelId: string;
        ownerId: string;
        discoverable?: boolean;
    }

    export interface ActiveStream {
        streamType: string;
        guildId: string | null;
        channelId: string;
        ownerId: string;
        state: string;
        endReason?: string;
        errorCode?: string;
    }

    export interface StreamerActiveStreamMetadata {
        id?: string;
        pid?: number;
        sourceName?: string | null;
        previewDisabled?: boolean;
        sourceIcon?: string;
        sourceId?: string;
    }

    export interface RTCStream {
        streamKey: string;
        region: string;
        viewerIds: string[];
    }

    export interface State {
        selfStreamParticipantsHidden: Record<string, boolean>;
    }
}

export class ApplicationStreamingStore extends FluxStore {
    getState(): ApplicationStreamingStore.State;
    isSelfStreamHidden(channelId: string): boolean;
    getLastActiveStream(): ApplicationStreamingStore.ActiveStream | null;
    getAllActiveStreams(): ApplicationStreamingStore.ActiveStream[];
    getAllActiveStreamsForChannel(channelId: string): ApplicationStreamingStore.ActiveStream[];
    getActiveStreamForStreamKey(streamKey: string): ApplicationStreamingStore.ActiveStream | null;
    getActiveStreamForApplicationStream(stream: ApplicationStreamingStore.ApplicationStream): ApplicationStreamingStore.ActiveStream | null;
    getCurrentUserActiveStream(): ApplicationStreamingStore.ActiveStream | null;
    getActiveStreamForUser(userId: string, guildId?: string | null): ApplicationStreamingStore.ActiveStream | null;
    getStreamerActiveStreamMetadata(): ApplicationStreamingStore.StreamerActiveStreamMetadata | null;
    getStreamerActiveStreamMetadataForStream(streamKey: string): ApplicationStreamingStore.StreamerActiveStreamMetadata | null;
    getIsActiveStreamPreviewDisabled(streamKey: string): boolean;
    getAnyStreamForUser(userId: string | bigint): ApplicationStreamingStore.ApplicationStream | null;
    getAnyDiscoverableStreamForUser(userId: string): ApplicationStreamingStore.ApplicationStream | null;
    getStreamForUser(userId: string, guildId?: string | null): ApplicationStreamingStore.ApplicationStream | null;
    getRTCStream(streamKey: string): ApplicationStreamingStore.RTCStream | null;
    getAllApplicationStreams(): ApplicationStreamingStore.ApplicationStream[];
    getAllApplicationStreamsForChannel(channelId: string): ApplicationStreamingStore.ApplicationStream[];
    getViewerIds(streamKey: string | ApplicationStreamingStore.ActiveStream): string[];
    getCurrentAppIntent(): string | null;
    getStreamingState(): {
        activeStreams: Array<[string, ApplicationStreamingStore.ActiveStream]>;
        streamsByUserAndGuild: Record<string, Record<string, ApplicationStreamingStore.ApplicationStream>>;
        rtcStreams: Record<string, ApplicationStreamingStore.RTCStream>;
        streamerActiveStreamMetadatas: Record<string, ApplicationStreamingStore.StreamerActiveStreamMetadata | null>;
    };
}
