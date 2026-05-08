import { FluxStore } from "..";

export interface AnalyticsLogEvent {
    key: string;
    event: string;
    properties?: Record<string, any>;
    fingerprint: string;
    timestamp: Date;
}

export interface AnalyticsLogTrigger {
    key: string;
    experimentId: string;
    descriptor: string;
    exposureType: string;
    excluded: boolean;
    location: string;
    previouslyTracked: boolean;
    timestamp: Date;
}

export class AnalyticsLogStore extends FluxStore {
    get loggedEvents(): AnalyticsLogEvent[];
    get loggedEventsVersion(): number;
    get loggedTriggers(): AnalyticsLogTrigger[];
    get trackTriggers(): boolean;
}
