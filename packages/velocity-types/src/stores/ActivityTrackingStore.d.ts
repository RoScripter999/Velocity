import { FluxStore } from "..";

export interface ActivityTrackingData {
    applicationId: string;
    updatedAt: number;
    distributor?: string;
    shareActivity?: boolean;
    token: string | null;
    duration?: number;
    closed?: boolean;
    exePath?: string;
    voiceChannelId?: string | null;
    sessionId?: string | null;
    mediaSessionId?: string | null;
    isDiscordApplication?: boolean;
}

export class ActivityTrackingStore extends FluxStore {
    getActivities(): Record<string, ActivityTrackingData>;
}
