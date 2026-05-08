import { FluxStore } from "..";

export namespace AppliedGuildBoostStore {
    export interface AppliedBoost {
        id: string;
    }
}

export class AppliedGuildBoostStore extends FluxStore {
    getAppliedGuildBoostsForGuild(guildId: string): any[] | null;
    getLastFetchedAtForGuild(guildId: string): number | null;
    getCurrentUserAppliedBoosts(): AppliedGuildBoostStore.AppliedBoost[];
    getAppliedGuildBoost(boostId: string): AppliedGuildBoostStore.AppliedBoost | undefined;
    get isModifyingAppliedBoost(): boolean;
    get applyBoostError(): any;
    get unapplyBoostError(): any;
    get cooldownEndsAt(): number | null;
    get isFetchingCurrentUserAppliedBoosts(): boolean;
}
