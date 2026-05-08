import { FluxStore } from "..";

export class GuildSubscriptionsStore extends FluxStore {
    /** Get all subscribed thread IDs */
    getSubscribedThreadIds(): string[];

    /** Check if subscribed to threads in a guild */
    isSubscribedToThreads(guildId: string): boolean;

    /** Check if subscribed to any member in a guild */
    isSubscribedToAnyMember(guildId: string): boolean;

    /** Check if subscribed to member updates in a guild */
    isSubscribedToMemberUpdates(guildId: string): boolean;

    /** Check if subscribed to any guild channel */
    isSubscribedToAnyGuildChannel(guildId: string): boolean;
}
