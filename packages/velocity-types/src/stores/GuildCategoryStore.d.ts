import { Channel, FluxStore } from "..";

export namespace GuildCategoryStore {
    export interface CategoryItem {
        channel: any;
        index: number;
    }

    export interface GuildCategories {
        _categories: CategoryItem[];
        [categoryId: string]: CategoryItem[];
        null: CategoryItem[];
    }
}

export class GuildCategoryStore extends FluxStore {
    /** Get categorized channels for a guild */
    getCategories(guildId?: string): GuildCategoryStore.GuildCategories;
}
