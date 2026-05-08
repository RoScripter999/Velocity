import { FluxStore } from "..";

export namespace ApplicationDirectoryCategoriesStore {
    export interface Category {
        id: string;
        name: string;
        [key: string]: any;
    }
}

export class ApplicationDirectoryCategoriesStore extends FluxStore {
    getLastFetchTimeMs(): number | null;
    getCategories(): ApplicationDirectoryCategoriesStore.Category[];
    getCategory(categoryId: string): ApplicationDirectoryCategoriesStore.Category | undefined;
}
