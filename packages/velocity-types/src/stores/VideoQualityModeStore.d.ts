import { FluxStore } from "..";

export class VideoQualityModeStore extends FluxStore {
    /** Get current video quality mode */
    get mode(): string;
}
