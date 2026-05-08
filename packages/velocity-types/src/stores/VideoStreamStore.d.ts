import { FluxStore } from "..";

export namespace VideoStreamStore {
    export interface StreamData {
        streamId: string;
    }

    export interface TimedoutVideo {
        videoStreamId: string;
        userId: string;
        streamKey: string;
        mediaContext: string;
    }
}

export class VideoStreamStore extends FluxStore {
    /** Get stream ID for a user */
    getStreamId(userId: string, guildId?: string, mediaContext?: string): string | undefined;

    /** Get user stream data */
    getUserStreamData(userId: string, guildId?: string, mediaContext?: string): VideoStreamStore.StreamData | undefined;

    /** Get all timed out videos */
    getTimedoutVideos(): Record<string, VideoStreamStore.TimedoutVideo>;

    /** Get timed out video */
    getTimedoutVideo(mediaContext: string, userId: string): VideoStreamStore.TimedoutVideo | undefined;
}
