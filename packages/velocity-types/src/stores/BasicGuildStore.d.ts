import { FluxStore, Guild } from "..";

export namespace BasicGuildStore {
    export type GuildStatus = Guild | { type: "loading"; } | { type: "failed"; };
}

export class BasicGuildStore extends FluxStore {
    getGuild(guildId: string): Guild | undefined;
    isGuildFetching(guildId: string): boolean;
    getGuildOrStatus(guildId: string): BasicGuildStore.GuildStatus | undefined;
    getVersion(): number;
}
