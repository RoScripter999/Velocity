import { FluxStore } from "..";

export class BitRateStore extends FluxStore {
    /** Get current voice channel bitrate */
    get bitrate(): number | 64000;
}
