import { FluxStore } from "..";

export namespace RTCRegionStore {
    export interface State {
        preferredRegions: string[] | null;
        lastTestTimestamp: number | null;
        lastGeoRankedOrder: string[] | null;
    }
}

export class RTCRegionStore extends FluxStore {
    /** Get the user-agnostic RTC region state */
    getUserAgnosticState(): RTCRegionStore.State;

    /** Check if a preferred region is set */
    shouldIncludePreferredRegion(): boolean;

    /** Get the primary preferred region */
    getPreferredRegion(): string | null;

    /** Get all preferred regions */
    getPreferredRegions(): string[] | null;

    /** Extract region ID from a full region string (e.g. "us-east-1" -> "us-east") */
    getRegion(regionId: string): string | undefined;

    /** Check if a latency test should be performed based on geo-ranked order */
    shouldPerformLatencyTest(geoRankedOrder: string[]): boolean;
}
