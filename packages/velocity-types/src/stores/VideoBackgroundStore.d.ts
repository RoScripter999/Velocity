import { FluxStore } from "..";

export namespace VideoBackgroundStore {
    export interface VideoFilterAsset {
        id: string;
        [key: string]: any;
    }

    export interface State {
        videoFilterAssets: Record<string, VideoFilterAsset>;
        /** Whether a video filter has been applied in current session */
        hasBeenApplied: boolean;
        /** Whether user has used a background in a voice call */
        hasUsedBackgroundInCall: boolean;
        /** Current voice channel ID */
        voiceChannelId: string | null;
    }
}

export class VideoBackgroundStore extends FluxStore {
    /** Get all available video filter assets */
    get videoFilterAssets(): Record<string, VideoBackgroundStore.VideoFilterAsset>;

    /** Check if a video filter has been applied in current session */
    get hasBeenApplied(): boolean;

    /** Check if user has used a background in a voice call */
    get hasUsedBackgroundInCall(): boolean;
}
