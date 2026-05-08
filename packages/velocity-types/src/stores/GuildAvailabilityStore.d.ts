import { FluxStore } from "..";

export class GuildAvailabilityStore extends FluxStore {
    /** Check if a guild is unavailable */
    isUnavailable(guildId: string | null): boolean;

    /** Get total guild count (available + unavailable) */
    get totalGuilds(): number;

    /** Get count of unavailable guilds */
    get totalUnavailableGuilds(): number;

    /** Get array of unavailable guild IDs */
    get unavailableGuilds(): string[];
}
