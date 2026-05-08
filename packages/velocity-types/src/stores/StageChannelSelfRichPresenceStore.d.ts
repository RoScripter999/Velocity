import { FluxStore } from "..";

export namespace StageChannelSelfRichPresenceStore {
    export interface Activity {
        application_id: string;
        name: string;
        type: number;
        timestamps: {
            start: number;
        };
        assets: {
            small_image?: string;
            small_text: string;
        };
        party: {
            id: string;
            /** [speakers, total] */
            size: [number, number];
        };
    }

    export interface State {
        activity: Activity | null;
    }
}

export class StageChannelSelfRichPresenceStore extends FluxStore {
    /** Get the current stage channel activity for rich presence */
    getActivity(): StageChannelSelfRichPresenceStore.Activity | null;
}
