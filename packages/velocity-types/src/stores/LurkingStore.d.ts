import { FluxStore } from "..";

export class LurkingStore extends FluxStore {
    /** Get all guild IDs the user is lurking in */
    lurkingGuildIds(): string[];

    /** Get the most recently lurked guild ID */
    mostRecentLurkedGuildId(): string | null;

    /** Check if user is lurking in a guild */
    isLurking(guildId: string): boolean;

    /** Get the source of the current lurking session */
    getLurkingSource(): any;

    /** Get the load ID for a lurked guild */
    getLoadId(guildId: string): string | undefined;
}
