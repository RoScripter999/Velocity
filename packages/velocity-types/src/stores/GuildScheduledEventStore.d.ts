import { FluxStore } from "..";

export namespace GuildScheduledEventStore {
    export interface GuildScheduledEvent {
        id: string;
        guild_id: string;
        channel_id?: string;
        entity_id?: string;
        scheduled_start_time: string;
        scheduled_end_time?: string;
        status: string;
        guild_scheduled_event_exceptions?: EventException[];
        [key: string]: any;
    }

    export interface EventException {
        event_exception_id: string;
        event_id: string;
        [key: string]: any;
    }

    export interface GuildScheduledEventUser {
        user_id: string;
        guild_scheduled_event_id: string;
        guild_scheduled_event_exception_id?: string;
        response: string;
        member?: any;
    }
}

export const GuildScheduledEventIndexKeys: {
    EVENT: string;
    EVENT_ACTIVE: string;
    EVENT_UPCOMING: string;
    GUILD_EVENT: (guildId: string) => string;
    GUILD_EVENT_ACTIVE: (guildId: string) => string;
    GUILD_EVENT_UPCOMING: (guildId: string) => string;
    CHANNEL_EVENT: (channelId: string) => string;
    CHANNEL_EVENT_ACTIVE: (channelId: string) => string;
    CHANNEL_EVENT_UPCOMING: (channelId: string) => string;
};

export function isEventActive(event: GuildScheduledEventStore.GuildScheduledEvent): boolean;

export function isEventCanceled(event: GuildScheduledEventStore.GuildScheduledEvent): boolean;

export function isEventStale(event: GuildScheduledEventStore.GuildScheduledEvent, seconds: number): boolean;

export function isEventCompleted(event: GuildScheduledEventStore.GuildScheduledEvent): boolean;

export class GuildScheduledEventStore extends FluxStore {
    /** Get a guild scheduled event */
    getGuildScheduledEvent(eventId: string): GuildScheduledEventStore.GuildScheduledEvent | null;

    /** Get guild event count by index */
    getGuildEventCountByIndex(index: string): number;

    /** Get guild scheduled events for a guild */
    getGuildScheduledEventsForGuild(guildId: string): GuildScheduledEventStore.GuildScheduledEvent[];

    /** Get guild scheduled events by index */
    getGuildScheduledEventsByIndex(index: string): GuildScheduledEventStore.GuildScheduledEvent[];

    /** Get RSVP version (changes when RSVPs update) */
    getRsvpVersion(): number;

    /** Get RSVP for a user */
    getRsvp(eventId: string, exceptionId?: string, userId?: string): GuildScheduledEventStore.GuildScheduledEventUser | null;

    /** Check if user is interested in event recurrence */
    isInterestedInEventRecurrence(eventId: string, exceptionId?: string): boolean;

    /** Get user count for an event */
    getUserCount(eventId: string, exceptionId?: string): number;

    /** Check if has user count for an event */
    hasUserCount(eventId: string, exceptionId?: string): boolean;

    /** Check if event is active */
    isActive(eventId: string): boolean;

    /** Get active event by channel */
    getActiveEventByChannel(channelId: string): GuildScheduledEventStore.GuildScheduledEvent | undefined;

    /** Get users for a guild event */
    getUsersForGuildEvent(eventId: string, exceptionId?: string): Record<string, GuildScheduledEventStore.GuildScheduledEventUser>;
}
