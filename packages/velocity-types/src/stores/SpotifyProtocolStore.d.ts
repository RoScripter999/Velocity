import { FluxStore } from "..";

export namespace SpotifyProtocolStore {
    export interface State {
        isRegistered: boolean;
    }
}

export class SpotifyProtocolStore extends FluxStore {
    /** Check if Spotify protocol is registered on the system */
    isProtocolRegistered(): boolean;
}
