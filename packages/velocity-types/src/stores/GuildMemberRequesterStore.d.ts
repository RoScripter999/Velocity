import { FluxStore } from "..";

export class GuildMemberRequesterStore extends FluxStore {
    /** Request a specific member for a guild */
    requestMember(guildId: string, userId: string): void;

    /** Get debug state for a guild */
    getDebugState(guildId: string): any;
}
