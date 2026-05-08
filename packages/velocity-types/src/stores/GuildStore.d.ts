import { Guild, FluxStore } from "..";

export class GuildStore extends FluxStore {
    /** Get a specific guild by ID */
    getGuild(guildId: string): Guild;

    /** Get the total count of guilds */
    getGuildCount(): number;

    /** Get all guilds as an object */
    getGuilds(): Record<string, Guild>;

    /** Get all guilds as an array */
    getGuildsArray(): Guild[];

    /** Get all guild IDs */
    getGuildIds(): string[];
}
