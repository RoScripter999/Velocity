import { FluxStore } from "..";

export namespace PopoutWindowStore {
    export interface WindowState {
        x: number;
        y: number;
        width: number;
        height: number;
        alwaysOnTop?: boolean;
    }

    export interface PopoutWindowOptions {
        defaultWidth?: number;
        defaultHeight?: number;
        defaultAlwaysOnTop?: boolean;
        outOfProcessOverlay?: boolean;
        [key: string]: any;
    }
}

export class PopoutWindowStore extends FluxStore {
    /** Get window by key */
    getWindow(key: string): Window | undefined;

    /** Get saved window state */
    getWindowState(key: string): PopoutWindowStore.WindowState | undefined;

    /** Get all window keys */
    getWindowKeys(): string[];

    /** Check if window is open */
    getWindowOpen(key: string): boolean;

    /** Check if window is always on top */
    getIsAlwaysOnTop(key: string): boolean;

    /** Check if window is focused */
    getWindowFocused(key: string): boolean;

    /** Check if window is visible */
    getWindowVisible(key: string): boolean;

    /** Get current state */
    getState(): Record<string, PopoutWindowStore.WindowState | undefined>;

    /** Check if window is fully initialized */
    isWindowFullyInitialized(key: string): boolean;

    /** Check if window is fullscreen */
    isWindowFullScreen(key: string): boolean;

    /** Unmount a window */
    unmountWindow(key: string): void;
}
