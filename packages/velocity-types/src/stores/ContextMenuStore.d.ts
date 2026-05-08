import { FluxStore } from "..";

export namespace ContextMenuStore {
    export interface ContextMenu {
        [key: string]: any;
    }
}

export class ContextMenuStore extends FluxStore {
    isOpen(): boolean;
    get version(): number;
    getContextMenu(): ContextMenuStore.ContextMenu | null;
    close(): boolean;
}
