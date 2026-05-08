import { FluxStore } from "..";

export namespace SpotifyStore {
    export interface Album {
        id: string;
        name: string;
        image?: {
            url: string;
            [key: string]: any;
        };
        type: string;
    }

    export interface Artist {
        id: string;
        name: string;
    }

    export interface Track {
        id: string;
        name: string;
        duration: number;
        type: "track" | "episode";
        album: Album;
        artists: Artist[];
        isLocal: boolean;
    }

    export interface Device {
        id: string;
        name: string;
        type: string;
        is_active: boolean;
        is_restricted: boolean;
        volume_percent: number;
    }

    export interface Context {
        uri: string;
        type: string;
        public?: boolean;
        [key: string]: any;
    }

    export interface PlayerState {
        account: {
            id: string;
            showActivity: boolean;
        };
        track: Track;
        startTime: number;
        context?: Context;
        repeat: boolean;
    }

    export interface ListenAlongState {
        userId: string;
        partyId: string;
        trackId: string;
        startTime: number;
    }

    export interface Activity {
        context_uri?: string;
        album_id: string;
        artist_ids: string[];
        type: string;
        button_urls: string[];
        name: string;
        assets: Record<string, any>;
        details: string;
        state?: string;
        timestamps: {
            start: number;
            end: number;
        };
        party: {
            id: string;
        };
        sync_id?: string;
        flags?: number;
        metadata?: Record<string, any>;
    }

    export interface State {
        [accountId: string]: {
            connected: boolean;
            isPremium: boolean;
            playerState: PlayerState | null;
            devices: Device[];
        };
    }
}

export class SpotifyStore extends FluxStore {
    /** Check if user has a connected Spotify account */
    hasConnectedAccount(): boolean;

    /** Get the active socket and device currently playing */
    getActiveSocketAndDevice(): { socket: any; device: SpotifyStore.Device; } | null;

    /** Get all playable computer devices */
    getPlayableComputerDevices(): Array<{ socket: any; device: SpotifyStore.Device; }>;

    /** Check if a party activity can be played */
    canPlay(activity: { sync_id: string; party: { id: string; }; }): boolean;

    /** Get the user currently being listened along with */
    getSyncingWith(): SpotifyStore.ListenAlongState | null;

    /** Check if playback was auto paused */
    wasAutoPaused(): boolean;

    /** Get the last played track ID */
    getLastPlayedTrackId(): string | null;

    /** Get the current track being played */
    getTrack(): SpotifyStore.Track | null;

    /** Get player state for a specific account */
    getPlayerState(accountId: string): SpotifyStore.PlayerState | null;

    /** Check if Spotify activity should be shown to other users */
    shouldShowActivity(): boolean;

    /** Get the current Spotify activity for rich presence */
    getActivity(): SpotifyStore.Activity | null;
}
