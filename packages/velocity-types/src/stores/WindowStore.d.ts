import { FluxStore } from "..";

export namespace WindowStore {
    export interface WindowState {
        isElementFullscreen: boolean;
        focused: boolean;
        windowSize: {
            width: number;
            height: number;
        };
        visible: boolean;
    }
}

export class WindowStore extends FluxStore {
    isFocused(): boolean;
    isAppFocused(): boolean;
    isVisible(): boolean;
    getFocusedWindowId(): string | null;
    getLastFocusedWindowId(): string | null;
    isElementFullScreen(): boolean;
    windowSize(): { width: number; height: number; };
}
