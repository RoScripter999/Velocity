import { FluxStore } from "..";

export namespace NewUserStore {
    export interface State {
        type: string | null;
    }
}

export class NewUserStore extends FluxStore {
    /** Get the new user type */
    getType(): string | null;

    /** Get current state */
    getState(): NewUserStore.State;
}
