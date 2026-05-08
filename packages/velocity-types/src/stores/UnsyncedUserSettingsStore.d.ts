import { FluxStore } from "..";

export namespace UnsyncedUserSettingsStore {
    export interface State {
        displayCompactAvatars?: boolean;
        lowQualityImageMode?: boolean;
        videoUploadQuality?: string;
        dataSavingMode?: boolean;
        expressionPickerWidth?: number;
        messageRequestSidebarWidth?: number;
        threadSidebarWidth?: number;
        postSidebarWidth?: number;
        callChatSidebarWidth?: number;
        homeSidebarWidth?: number;
        callParticipantsSidebarWidth?: number;
        callHeaderHeight?: number;
        useSystemTheme?: string;
        activityPanelHeight?: number;
        disableVoiceChannelChangeAlert?: boolean;
        disableEmbeddedActivityPopOutAlert?: boolean;
        disableActivityHardwareAccelerationPrompt?: boolean;
        disableInviteWithTextChannelActivityLaunch?: boolean;
        disableHideSelfStreamAndVideoConfirmationAlert?: boolean;
        pushUpsellDismissed?: boolean;
        disableActivityHostLeftNitroUpsell?: boolean;
        disableCallUserConfirmationPrompt?: boolean;
        disableApplicationSubscriptionCancellationSurvey?: boolean;
        darkSidebar?: boolean;
        saveCameraUploadsToDevice?: boolean;
        showPlayAgain?: boolean;
        disableVisualRefresh?: boolean;
        listDensity?: string;
        hdrDynamicRange?: string;
    }
}

export class UnsyncedUserSettingsStore extends FluxStore {
    /** Get current state */
    getUserAgnosticState(): UnsyncedUserSettingsStore.State;

    get displayCompactAvatars(): boolean;
    get lowQualityImageMode(): boolean;
    get videoUploadQuality(): string;
    get dataSavingMode(): boolean;
    get expressionPickerWidth(): number;
    get messageRequestSidebarWidth(): number;
    get threadSidebarWidth(): number;
    get postSidebarWidth(): number;
    get callChatSidebarWidth(): number;
    get homeSidebarWidth(): number;
    get callParticipantsSidebarWidth(): number;
    get callHeaderHeight(): number;
    get useSystemTheme(): string;
    get activityPanelHeight(): number;
    get disableVoiceChannelChangeAlert(): boolean;
    get disableEmbeddedActivityPopOutAlert(): boolean;
    get disableActivityHardwareAccelerationPrompt(): boolean;
    get disableInviteWithTextChannelActivityLaunch(): boolean;
    get disableHideSelfStreamAndVideoConfirmationAlert(): boolean;
    get pushUpsellUserSettingsDismissed(): boolean;
    get disableActivityHostLeftNitroUpsell(): boolean;
    get disableCallUserConfirmationPrompt(): boolean;
    get disableApplicationSubscriptionCancellationSurvey(): boolean;
    get darkSidebar(): boolean;
    get saveCameraUploadsToDevice(): boolean;
    get showPlayAgain(): boolean;
    isVisualRefreshDisabled(disabled: boolean): boolean;
    get listDensity(): string;
    get hdrDynamicRange(): string;
}
