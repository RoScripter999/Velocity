import { FluxStore } from "..";

export namespace NotificationSettingsStore {
    export interface NotificationSettings {
        desktopType: string;
        disableAllSounds: boolean;
        disabledSounds: string[];
        ttsType: string;
        disableUnreadBadge: boolean;
        taskbarFlash: boolean;
        notifyMessagesInSelectedChannel: boolean;
    }
}

export class NotificationSettingsStore extends FluxStore {
    /** Get the user-agnostic notification settings state */
    getUserAgnosticState(): NotificationSettingsStore.NotificationSettings;

    /** Get desktop notification type */
    getDesktopType(): string;

    /** Get text-to-speech notification type */
    getTTSType(): string;

    /** Get array of disabled sound notification types */
    getDisabledSounds(): string[];

    /** Check if all sounds are disabled */
    getDisableAllSounds(): boolean;

    /** Check if unread badge is disabled */
    getDisableUnreadBadge(): boolean;

    /** Check if notifications are enabled for selected channel */
    getNotifyMessagesInSelectedChannel(): boolean;

    /** Check if taskbar flash is enabled */
    get taskbarFlash(): boolean;

    /** Check if a specific sound is disabled */
    isSoundDisabled(soundType: string): boolean;
}
