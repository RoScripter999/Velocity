import { FluxStore } from "..";

export namespace GuildBoostSlotStore {
    export interface GuildBoostSlot {
        id: string;
        subscriptionId: string;
        subscription?: any;
        [key: string]: any;
    }
}

export class GuildBoostSlotStore extends FluxStore {
    get hasFetched(): boolean;
    get isFetching(): boolean;
    get boostSlots(): Record<string, GuildBoostSlotStore.GuildBoostSlot>;
    getGuildBoostSlot(slotId: string): GuildBoostSlotStore.GuildBoostSlot | undefined;
}
