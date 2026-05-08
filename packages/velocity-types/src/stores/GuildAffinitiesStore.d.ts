import { FluxStore } from "..";

export namespace GuildAffinitiesStore {
    export interface GuildAffinity {
        score: number;
        guildId: string;
        index: number;
    }

    export interface State {
        guildAffinitiesByGuildId: Record<string, GuildAffinity>;
        guildAffinities: GuildAffinity[];
        lastFetched: number;
    }
}

export class GuildAffinitiesStore extends FluxStore {
    /** Get current state */
    getState(): GuildAffinitiesStore.State;

    /** Get affinity score for a guild */
    getGuildAffinity(guildId: string): GuildAffinitiesStore.GuildAffinity | undefined;

    /** Get all affinities */
    get affinities(): GuildAffinitiesStore.GuildAffinity[];

    /** Check if affinity request has resolved */
    get hasRequestResolved(): boolean;
}
