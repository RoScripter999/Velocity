import { FluxStore } from "..";

export namespace EmbeddedActivitiesStore {
    export interface Location {
        id: string;
        [key: string]: any;
    }

    interface Participant {
        userId: string;
        sessionId: string;
        nonce?: string;
    }

    export interface EmbeddedActivity {
        applicationId: string;
        location: Location;
        launchId?: string;
        compositeInstanceId?: string;
        url: string;
        userIds: Set<string>;
        participants: Participant[];
        referrerId?: string;
        customId?: string;
        proxyTicket?: string;
        connectedSince?: number;
        config?: any;
    }

    export interface LaunchState {
        isLaunching: boolean;
        componentId?: string;
        inviterUserId?: string;
        launchParams?: any;
        proxyTicket?: string;
    }

    export interface ShelfActivity {
        application_id: string;
        client_platform_config: Record<string, any>;
        [key: string]: any;
    }

    export interface State {
        everLaunchedActivities: Set<string>;
        seenNewActivities: Record<string, boolean>;
        seenUpdatedActivities: Record<string, boolean>;
        lastCheckedForBadgeableActivities: string | null;
        dateRangesForSurfaces: Record<string, { fromDate: string; untilDate: string; }>;
    }
}

export const DEFAULT_EMBEDDED_ACTIVITIES: EmbeddedActivitiesStore.EmbeddedActivity[];

export class EmbeddedActivitiesStore extends FluxStore {
    /** Get state */
    getState(): EmbeddedActivitiesStore.State;

    /** Get self embedded activity for a channel */
    getSelfEmbeddedActivityForChannel(channelId: string): EmbeddedActivitiesStore.EmbeddedActivity | null;

    /** Get self embedded activity for a location */
    getSelfEmbeddedActivityForLocation(location: EmbeddedActivitiesStore.Location): EmbeddedActivitiesStore.EmbeddedActivity | null;

    /** Get all self embedded activities */
    getSelfEmbeddedActivities(): Map<string, EmbeddedActivitiesStore.EmbeddedActivity>;

    /** Get embedded activities for a guild */
    getEmbeddedActivitiesForGuild(guildId: string): EmbeddedActivitiesStore.EmbeddedActivity[];

    /** Get embedded activities for a channel */
    getEmbeddedActivitiesForChannel(channelId: string): EmbeddedActivitiesStore.EmbeddedActivity[];

    /** Get embedded activities for a location */
    getEmbeddedActivitiesForLocation(location: EmbeddedActivitiesStore.Location): EmbeddedActivitiesStore.EmbeddedActivity[];

    /** Get embedded activities for starting channel */
    getEmbeddedActivitiesForStartingChannel(channelId: string): EmbeddedActivitiesStore.EmbeddedActivity[];

    /** Get embedded activities by channel */
    getEmbeddedActivitiesByChannel(): Map<string, EmbeddedActivitiesStore.EmbeddedActivity[]>;

    /** Get embedded activity duration in ms */
    getEmbeddedActivityDurationMs(channelId: string, applicationId: string): number | null;

    /** Check if launching activity */
    isLaunchingActivity(): boolean;

    /** Get shelf activities for a guild */
    getShelfActivities(guildId: string): EmbeddedActivitiesStore.ShelfActivity[];

    /** Get shelf fetch status */
    getShelfFetchStatus(guildId: string): { isFetching: boolean; lastFetchTimestampMs?: number; } | undefined;

    /** Check if should fetch shelf */
    shouldFetchShelf(guildId: string): boolean;

    /** Get orientation lock state for app */
    getOrientationLockStateForApp(applicationId: string): any;

    /** Get PiP orientation lock state for app */
    getPipOrientationLockStateForApp(applicationId: string): any;

    /** Get grid orientation lock state for app */
    getGridOrientationLockStateForApp(applicationId: string): any;

    /** Get layout mode for app */
    getLayoutModeForApp(applicationId: string): string | undefined;

    /** Get connected activity channel ID */
    getConnectedActivityChannelId(): string | undefined;

    /** Get connected activity location */
    getConnectedActivityLocation(): EmbeddedActivitiesStore.Location | undefined;

    /** Get activity panel mode */
    getActivityPanelMode(): string;

    /** Get focused layout */
    getFocusedLayout(): string;

    /** Get current embedded activity */
    getCurrentEmbeddedActivity(): EmbeddedActivitiesStore.EmbeddedActivity | undefined;

    /** Check if proxy ticket is refreshing */
    isProxyTicketRefreshing(applicationId: string): boolean;

    /** Get embedded activity for user ID */
    getEmbeddedActivityForUserId(userId: string, applicationId?: string): EmbeddedActivitiesStore.EmbeddedActivity | undefined;

    /** Check if activity has ever been launched */
    hasActivityEverBeenLaunched(applicationId: string): boolean;

    /** Get launch state */
    getLaunchState(applicationId: string, channelId?: string): EmbeddedActivitiesStore.LaunchState | undefined;

    /** Get all launch states */
    getLaunchStates(): Map<string, EmbeddedActivitiesStore.LaunchState>;

    /** Get activity popout window layout */
    getActivityPopoutWindowLayout(): string;
}
