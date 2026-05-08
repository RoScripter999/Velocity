import { FluxStore } from "..";

export namespace DismissibleContentShownStateStore {
    export interface Candidate {
        content: string;
        groupName?: string;
        onAdded?(): void;
    }
}

export class DismissibleContentShownStateStore extends FluxStore {
    setHasRequiredAction(): void;
}
