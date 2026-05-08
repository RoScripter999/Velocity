import { FluxStore } from "..";

export namespace SessionsStore {
    export interface Activity {
        session_id: string;
        type: number;
        name: string;
        url: string | null;
        application_id: string;
        status_display_type?: number;
        state?: string;
        state_url?: string;
        details?: string;
        details_url?: string;
        emoji?: {
            name: string;
            id: string | null;
            animated?: boolean;
        } | null;
        assets?: {
            large_image?: string;
            large_text?: string;
            large_url?: string;
            small_image?: string;
            small_text?: string;
            small_url?: string;
        };
        timestamps?: {
            start?: number;
            end?: number;
        };
        party?: {
            id?: string;
            size?: [number, number];
            privacy?: number;
        };
        secrets?: {
            match?: string;
            join?: string;
        };
        sync_id?: string;
        created_at?: number;
        instance?: boolean;
        flags?: number;
        metadata?: Record<string, any>;
        platform?: string;
        supported_platforms?: string[];
        buttons?: string[];
        hangStatus?: string;
    }

    export interface ClientInfo {
        os: string;
        platform: string;
        client: string;
        location?: string;
    }

    export interface Session {
        sessionId: string;
        active: boolean;
        activities: Activity[];
        hiddenActivities?: Activity[];
        lastModified?: string;
        status?: string;
        clientInfo: ClientInfo;
    }
}

export class SessionsStore extends FluxStore {
    getSessions(): Record<string, SessionsStore.Session>;
    getSession(): SessionsStore.Session | null;
    getRemoteActivities(): SessionsStore.Activity[];
    getHiddenActivities(): SessionsStore.Activity[];
    getSessionById(sessionId: string): SessionsStore.Session | undefined;
    getActiveSession(): SessionsStore.Session | undefined;
    getRemoteApplicationActivity(applicationId: string): SessionsStore.Activity | null;
}
