import { FluxStore } from "..";

export namespace CategoryCollapseStore {
    export interface State {
        [channelId: string]: boolean;
    }
}

export class CategoryCollapseStore extends FluxStore {
    getState(): CategoryCollapseStore.State;
    isCollapsed(channelId: string): boolean;
    getCollapsedCategories(): CategoryCollapseStore.State;
    get version(): number;
}
