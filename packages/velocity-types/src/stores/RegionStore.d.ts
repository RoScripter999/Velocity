import { FluxStore } from "..";

export namespace RegionStore {
    export interface Region {
        id: string;
        name: string;
        optimal?: boolean;
        vip?: boolean;
        deprecated?: boolean;
    }
}

export class RegionStore extends FluxStore {
    getOptimalRegion(guildId?: string | null): RegionStore.Region | null;
    getOptimalRegionId(guildId?: string | null): string | null;
    getRandomRegion(guildId?: string | null): RegionStore.Region | null;
    getRandomRegionId(guildId?: string | null): string | null;
    getRegions(guildId?: string | null): RegionStore.Region[] | null;
}
