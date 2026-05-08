import { FluxStore } from "..";

export class GuildMemberCountStore extends FluxStore {
    /** Get all member counts by guild ID */
    getMemberCounts(): Record<string, number>;

    /** Get member count for a specific guild */
    getMemberCount(guildId?: string | null): number | null;

    /** Get online member count for a specific guild */
    getOnlineCount(guildId?: string | null): number | null;
}
