import { FluxStore } from "..";

export class GuildNSFWAgreeStore extends FluxStore {
    /** Check if user has agreed to NSFW content for a guild */
    didAgree(guildId: string): boolean;
}
