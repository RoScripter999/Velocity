import { FluxStore } from "..";

export class UserRequiredActionStore extends FluxStore {
    /** Check if there is a required action */
    hasAction(): boolean;

    /** Get the current required action */
    getAction(): any | null;
}
