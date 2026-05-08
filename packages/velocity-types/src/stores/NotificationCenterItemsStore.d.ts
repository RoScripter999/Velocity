import { FluxStore } from "..";

export namespace NotificationCenterItemsStore {
    export interface NotificationItem {
        id: string;
        type: string;
        kind: string;
        acked?: boolean;
        completed?: boolean;
        forceUnacked?: boolean;
        local_id?: string;
        message?: any;
        applicationId?: string;
        guild_scheduled_event_id?: string;
        disable_action?: boolean;
        item_enum?: string;
        other_user?: any;
        [key: string]: any;
    }

    export interface State {
        loading: boolean;
        initialized: boolean;
        errored: boolean;
        isDataStale: boolean;
        notifCenterItems: NotificationItem[];
        staleNotifCenterItems: NotificationItem[];
        notifCenterIds: Set<string>;
        notifCenterLocalItems: NotificationItem[];
        paginationHasMore: boolean;
        paginationCursor?: string;
        notifCenterActive: boolean;
        notifCenterTabFocused: boolean;
    }
}

export class NotificationCenterItemsStore extends FluxStore {
    /** Get state */
    getState(): NotificationCenterItemsStore.State;

    /** Check if loading */
    get loading(): boolean;

    /** Check if initialized */
    get initialized(): boolean;

    /** Get items */
    get items(): NotificationCenterItemsStore.NotificationItem[];

    /** Check if has more items */
    get hasMore(): boolean;

    /** Get pagination cursor */
    get cursor(): string | undefined;

    /** Check if errored */
    get errored(): boolean;

    /** Check if notification center is active */
    get active(): boolean;

    /** Get local items */
    get localItems(): NotificationCenterItemsStore.NotificationItem[];

    /** Check if tab is focused */
    get tabFocused(): boolean;
}
