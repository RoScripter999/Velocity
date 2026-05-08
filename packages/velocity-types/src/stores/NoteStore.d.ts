import { FluxStore } from "..";

export namespace NoteStore {
    export interface Note {
        loading: boolean;
        note: string | null;
    }
}

export class NoteStore extends FluxStore {
    getNote(userId: string): NoteStore.Note | undefined;
}
