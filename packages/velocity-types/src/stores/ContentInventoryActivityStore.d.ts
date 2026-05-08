import { FluxStore } from "..";

export namespace ContentInventoryActivityStore {
    export interface Content {
        id: string;
        author_id: string;
        author_type: number;
        content_type: string;
        [key: string]: any;
    }

    export interface Activity {
        type: number;
        [key: string]: any;
    }
}

export class ContentInventoryActivityStore extends FluxStore {
    getMatchingActivity(content: ContentInventoryActivityStore.Content): ContentInventoryActivityStore.Activity | null;
    canRenderContent(content: ContentInventoryActivityStore.Content): boolean;
}
