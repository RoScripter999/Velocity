import { FluxStore } from "..";

export namespace GameLibraryViewStore {
    export interface State {
        sortDirection: string;
        sortKey: string;
        activeRowKey: string | undefined;
        isNavigatingByKeyboard: boolean;
    }
}

export class GameLibraryViewStore extends FluxStore {
    /** Get the current sort direction */
    get sortDirection(): string;

    /** Get the current sort key */
    get sortKey(): string;

    /** Get the currently active row key */
    get activeRowKey(): string | undefined;

    /** Check if user is navigating by keyboard */
    get isNavigatingByKeyboard(): boolean;
}
