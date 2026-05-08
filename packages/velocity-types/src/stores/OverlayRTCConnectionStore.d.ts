import { FluxStore } from "..";

export type ConnectionState = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "RTC_CONNECTED" | "FAILED";

export namespace OverlayRTCConnectionStore {
    export interface RTCConnectionState {
        state: ConnectionState;
        quality: number;
        pings: Array<{ value: number; }>;
        hostname: string | null;
        lossRate: number | null;
    }
}

export class OverlayRTCConnectionStore extends FluxStore {
    getConnectionState(lobbyId?: string): ConnectionState;
    getQuality(lobbyId?: string): number;
    getHostname(lobbyId?: string): string | null;
    getPings(lobbyId?: string): Array<{ value: number; }>;
    getAveragePing(lobbyId?: string): number;
    getLastPing(lobbyId?: string): number;
    getOutboundLossRate(lobbyId?: string): number | null;
}
