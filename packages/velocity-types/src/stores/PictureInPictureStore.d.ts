import { FluxStore } from "..";

export namespace PictureInPictureStore {
    export interface PIPWindow {
        id: string;
        component: string;
        position: string;
        props: Record<string, any>;
        docked: boolean;
        hidden?: boolean;
    }

    export interface PIPState {
        openPosition: string;
        pipWidths: Record<string, number>;
    }
}

export class PictureInPictureStore extends FluxStore {
    get pipWindow(): PictureInPictureStore.PIPWindow | null;
    get pipVideoWindow(): PictureInPictureStore.PIPWindow | null;
    get pipActivityWindow(): PictureInPictureStore.PIPWindow | null;
    get pipFrameWindow(): PictureInPictureStore.PIPWindow | null;
    get pipWindows(): Map<string, PictureInPictureStore.PIPWindow>;
    pipWidth(pipType: string): number;
    isEmbeddedActivityHidden(): boolean;
    isFrameHidden(): boolean;
    getDockedRect(id: string): any;
    isOpen(id: string): boolean;
    getState(): PictureInPictureStore.PIPState;
}
