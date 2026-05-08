import { FluxStore } from "..";

export namespace ExternalStreamingStore {
    interface StreamAssets {
        large_image?: string;
        [key: string]: any;
    }

    export interface Stream {
        url: string;
        name: string;
        assets: StreamAssets;
        details?: string;
        state?: string;
    }
}

export class ExternalStreamingStore extends FluxStore {
    /** Get current external stream (Twitch/YouTube) */
    getStream(): ExternalStreamingStore.Stream | null;
}
