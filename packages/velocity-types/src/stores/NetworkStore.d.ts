import { FluxStore } from "..";

export enum NetworkType {
    UNKNOWN = 0,
    ETHERNET = 1,
    WIFI = 2,
    CELLULAR = 3,
    BLUETOOTH = 4,
}

export enum NetworkSpeed {
    UNKNOWN = 0,
    SLOW_2G = 1,
    FAST_2G = 2,
    THREE_G = 3,
    FOUR_G = 4,
}

export class NetworkStore extends FluxStore {
    getType(): NetworkType;
    getEffectiveConnectionSpeed(): NetworkSpeed;
    getServiceProvider(): string | null;
}
