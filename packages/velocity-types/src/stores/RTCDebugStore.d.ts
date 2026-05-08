import { FluxStore } from "..";

export namespace RTCDebugStore {
    export interface InboundStats {
        codec?: string;
        resolution?: string;
        bitrateEstimate?: number;
    }

    export interface OutboundStats {
        codec?: string;
        resolution?: string;
        bitrateEstimate?: number;
    }
}

export class RTCDebugStore extends FluxStore {
    /** Get the current RTC debug section being displayed */
    getSection(): string;

    /** Get inbound stats for a specific user */
    getInboundStats(userId: string, context?: string): RTCDebugStore.InboundStats;

    /** Get outbound stats for a specific context */
    getOutboundStats(context?: string): RTCDebugStore.OutboundStats;

    /** Get all connection stats for a context */
    getAllStats(context?: string): any[];

    /** Get video streams being debugged */
    getVideoStreams(): any;

    /** Check if the next connection should be recorded */
    shouldRecordNextConnection(): boolean;

    /** Get simulcast quality override for a user and context */
    getSimulcastDebugOverride(userId: string, context: string): any;
}
