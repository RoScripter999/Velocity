import { FluxStore } from "..";

export enum AppLauncherEntrypoint {
    NONE = "NONE",
    TEXT = "TEXT",
    VOICE = "VOICE"
}

export enum AppLauncherCloseReason {
    DISMISSED = "DISMISSED",
    COMMAND = "COMMAND"
}

export interface AppLauncherState {
    show: boolean;
    entrypoint: AppLauncherEntrypoint;
    lastShownEntrypoint: AppLauncherEntrypoint;
    activeViewType: string | null;
    activeChannelId: string | null;
    closeReason: AppLauncherCloseReason;
    initialState?: any;
}

export class AppLauncherStore extends FluxStore {
    shouldShowPopup(): boolean;
    shouldShowModal(): boolean;
    entrypoint(): AppLauncherEntrypoint;
    lastShownEntrypoint(): AppLauncherEntrypoint;
    activeViewType(): string | null;
    activeChannelId(): string | null;
    closeReason(): AppLauncherCloseReason;
    initialState(): any;
}
