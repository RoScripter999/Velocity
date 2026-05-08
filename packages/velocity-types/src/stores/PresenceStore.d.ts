import { FluxStore } from "..";
import { ActivityFlags, ActivityType } from "../../enums";
import { Status } from '../common';

export type Platform = "desktop" | "mobile" | "web" | "embedded" | "vr";

export namespace PresenceStore {
    export interface Activity {
        type: ActivityType;
        name?: string;
        url?: string;
        created_at?: number;
        timestamps?: {
            start?: number;
            end?: number;
        };
        application_id?: string;
        details?: string;
        state?: string;
        emoji?: {
            name: string;
            id?: string;
            animated?: boolean;
        };
        party?: {
            id?: string;
            size?: [number, number];
        };
        assets?: {
            large_image?: string;
            large_text?: string;
            small_image?: string;
            small_text?: string;
        };
        secrets?: {
            match?: string;
            join?: string;
            spectate?: string;
        };
        instance?: boolean;
        flags?: ActivityFlags;
        buttons?: Array<{
            label: string;
            url: string;
        }>;
    }

    export interface ActivityMetadata {
        [key: string]: any;
    }

    export interface ClientStatusData {
        desktop?: Status;
        mobile?: Status;
        web?: Status;
    }
}

export class PresenceStore extends FluxStore {
    /** Set current user presence on connection open */
    setCurrentUserOnConnectionOpen(status: string, activities: PresenceStore.Activity[]): void;

    /** Get the status of a user (optionally for a specific guild) */
    getStatus(userId: string, guildId?: string | null): Status;

    /** Get filtered activities for a user */
    getActivities(userId: string, guildId?: string | null): PresenceStore.Activity[];

    /** Get unfiltered activities for a user */
    getUnfilteredActivities(userId: string, guildId?: string | null): PresenceStore.Activity[];

    /** Get hidden activities for a user */
    getHiddenActivities(userId: string, guildId?: string | null): PresenceStore.Activity[];

    /** Get the primary (first non-hang-status) activity for a user */
    getPrimaryActivity(userId: string, guildId?: string | null): PresenceStore.Activity | undefined;

    /** Get all activities across all users for a specific application */
    getAllApplicationActivities(applicationId: string): Array<{ userId: string; activity: PresenceStore.Activity; }>;

    /** Get activity for a user from a specific application */
    getApplicationActivity(userId: string, applicationId: string, guildId?: string | null): PresenceStore.Activity | undefined;

    /** Find an activity matching a predicate */
    findActivity(userId: string, predicate: (activity: PresenceStore.Activity) => boolean, guildId?: string | null, includeHidden?: boolean): PresenceStore.Activity | undefined;

    /** Get metadata for a user's activities */
    getActivityMetadata(userId: string): PresenceStore.ActivityMetadata | undefined;

    /** Get all user IDs with presence data */
    getUserIds(): string[];

    /** Check if a user is online on mobile */
    isMobileOnline(userId: string): boolean;

    /** Get client status (desktop/mobile/web) for a user */
    getClientStatus(userId: string): PresenceStore.ClientStatusData | undefined;

    getState(): {
        presencesForGuilds: Record<string, Record<string, any>>;
        statuses: Record<string, string>;
        activities: Record<string, PresenceStore.Activity[]>;
        filteredActivities: Record<string, PresenceStore.Activity[]>;
        hiddenActivities: Record<string, PresenceStore.Activity[]>;
        activityMetadata: Record<string, PresenceStore.ActivityMetadata>;
        clientStatuses: Record<string, PresenceStore.ClientStatusData>;
    };
}
