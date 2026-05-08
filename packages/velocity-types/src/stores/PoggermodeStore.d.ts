import { FluxStore } from "..";

export namespace PoggermodeStore {
    interface UserCombo {
        userId: string;
        channelId: string;
        value: number;
        multiplier: number;
        decayInterval: any;
    }

    interface MessageCombo {
        messageId: string;
        channelId: string;
        combo: UserCombo;
        displayed: boolean;
    }

    interface PoggermodeState {
        settingsVisible: boolean;
        enabled: boolean;
        combosEnabled: boolean;
        combosRequiredCount: number;
        comboSoundsEnabled: boolean;
        screenshakeEnabled: boolean;
        screenshakeEnabledLocations: Record<number, boolean>;
        shakeIntensity: number;
        confettiEnabled: boolean;
        confettiEnabledLocations: Record<number, boolean>;
        confettiSize: number;
        confettiCount: number;
        warningSeen: boolean;
    }
}

export class PoggermodeStore extends FluxStore {
    getComboScore(userId: string, channelId: string): number;
    getUserCombo(userId: string, channelId: string): PoggermodeStore.UserCombo | undefined;
    isComboing(userId: string, channelId: string): boolean;
    getMessageCombo(messageId: string): PoggermodeStore.UserCombo | undefined;
    getMostRecentMessageCombo(channelId: string): PoggermodeStore.MessageCombo | undefined;
    getUserComboShakeIntensity(userId: string, channelId: string, intensity: number, level: number): number;
}
