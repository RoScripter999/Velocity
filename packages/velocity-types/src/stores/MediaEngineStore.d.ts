import { FluxStore } from "..";

export namespace MediaEngineStore {
    export interface AudioSettings {
        mode: number;
        modeOptions: {
            threshold: number;
            autoThreshold: boolean;
            vadUseKrisp: boolean;
            vadKrispActivationThreshold: number;
            vadLeading: number;
            vadTrailing: number;
            delay: number;
            shortcut: string[];
            pttLatchingEnabled?: boolean;
            vadDuringPreProcess?: boolean;
        };
        mute: boolean;
        deaf: boolean;
        echoCancellation: boolean;
        noiseSuppression: boolean;
        automaticGainControl: boolean;
        noiseCancellation: boolean;
        bypassSystemInputProcessing: boolean;
        mostRecentlyRequestedVoiceFilter: string | null;
        voiceFilterPlaybackEnabled: boolean;
        silenceWarning: boolean;
        attenuation: number;
        attenuateWhileSpeakingSelf: boolean;
        attenuateWhileSpeakingOthers: boolean;
        localMutes: Record<string, boolean>;
        disabledLocalVideos: Record<string, boolean>;
        videoToggleStateMap: Record<string, number>;
        localVolumes: Record<string, number>;
        localPans: Record<string, { left: number; right: number; }>;
        inputVolume: number;
        outputVolume: number;
        inputDeviceId: string;
        outputDeviceId: string;
        videoDeviceId: string;
        qos: boolean;
        qosMigrated: boolean;
        videoHook: boolean;
        experimentalSoundshare2: boolean | null;
        useSystemScreensharePicker: boolean | null;
        h265Enabled: boolean;
        vadThrehsoldMigrated: boolean;
        aecDumpEnabled: boolean;
        sidechainCompression: boolean;
        sidechainCompressionSettingVersion: number;
        sidechainCompressionStrength: number;
        automaticAudioSubsystem: boolean;
        activeInputProfile: string | null;
        vadUseKrispSettingVersion: number;
        ncUseKrispSettingVersion: number;
        ncUseKrispjsSettingVersion: number;
    }

    export interface Device {
        id: string;
        index: number;
        name: string;
        disabled: boolean;
        guid?: string;
        hardwareId?: string;
        containerId?: string;
        facing?: string;
        effects?: string[];
    }

    export interface GoLiveSource {
        desktopSource?: {
            id: string;
            sourcePid?: number;
            soundshareId?: number;
            soundshareSession?: string;
        };
        cameraSource?: {
            videoDeviceGuid: string;
            audioDeviceGuid: string;
        };
        quality: {
            resolution: number;
            frameRate: number;
        };
    }

    export interface MediaEngineState {
        settingsByContext: Record<string, AudioSettings>;
        inputDevices: Record<string, Device>;
        outputDevices: Record<string, Device>;
        appSupported: Record<number, boolean>;
        krispModuleLoaded: boolean;
        krispVersion?: string;
        krispSuppressionLevel?: number;
        goLiveSource: GoLiveSource | null;
        goLiveContext: string;
    }
}

export class MediaEngineStore extends FluxStore {
    supports(capability: number): boolean;
    supportsInApp(capability: number): boolean;
    isSupported(): boolean;
    isNoiseSuppressionSupported(): boolean;
    isNoiseCancellationSupported(): boolean;
    isNoiseCancellationError(): boolean;
    isAutomaticGainControlSupported(): boolean;
    shouldOfferManualSubsystemSelection(): boolean;
    showBypassSystemInputProcessing(): boolean;
    isAdvancedVoiceActivitySupported(): boolean;
    isAecDumpSupported(): boolean;
    isSimulcastSupported(): boolean;
    goLiveSimulcastEnabled(): boolean;
    getAecDump(): boolean;
    getMediaEngine(): any;
    getVideoComponent(): any;
    getCameraComponent(): any;
    getKrispSuppressionLevel(): number;
    getKrispEnableStats(): boolean;
    isEnabled(): boolean;
    isMute(): boolean;
    isDeaf(): boolean;
    hasContext(context: string): boolean;
    isSelfMutedTemporarily(context?: string): boolean;
    isSelfMute(context?: string): boolean;
    shouldSkipMuteUnmuteSound(): boolean;
    notifyMuteUnmuteSoundWasSkipped(): void;
    isHardwareMute(context?: string): boolean;
    isEnableHardwareMuteNotice(): boolean;
    isSelfDeaf(context?: string): boolean;
    isVideoEnabled(): boolean;
    isVideoAvailable(): boolean;
    isScreenSharing(context?: string): boolean;
    isSoundSharing(context?: string): boolean;
    isLocalMute(userId: string, context?: string): boolean;
    supportsDisableLocalVideo(): boolean;
    isLocalVideoDisabled(userId: string, context?: string): boolean;
    getVideoToggleState(userId: string, context?: string): number;
    isLocalVideoAutoDisabled(userId: string, context?: string): boolean;
    isAnyLocalVideoAutoDisabled(context?: string): boolean;
    isMediaFilterSettingLoading(): boolean;
    isNativeAudioPermissionReady(): boolean;
    getGoLiveSource(): MediaEngineStore.GoLiveSource | null;
    getGoLiveContext(): string;
    getLastAudioInputDeviceChangeTimestamp(): number;
    getLocalPan(userId: string, context?: string): { left: number; right: number; };
    getLocalVolume(userId: string, context?: string): number;
    getInputVolume(): number;
    getOutputVolume(): number;
    getMode(context?: string): number;
    getModeOptions(context?: string): any;
    getActiveVoiceFilter(): string | null;
    getActiveVoiceFilterAppliedAt(): number | null;
    getPreviousVoiceFilter(): string | null;
    getPreviousVoiceFilterAppliedAt(): number | null;
    getMostRecentlyRequestedVoiceFilter(): string | null;
    getVoiceFilterPlaybackEnabled(): boolean;
    getShortcuts(): Record<string, string[]>;
    getInputDeviceId(): string;
    getOutputDeviceId(): string;
    getVideoDeviceId(): string;
    getInputDevices(): Record<string, MediaEngineStore.Device>;
    getOutputDevices(): Record<string, MediaEngineStore.Device>;
    getVideoDevices(): Record<string, MediaEngineStore.Device>;
    getEchoCancellation(): boolean;
    getSidechainCompression(): boolean;
    getSidechainCompressionStrength(): number;
    getH265Enabled(): boolean;
    hasH265HardwareDecode(): boolean;
    getLoopback(): boolean;
    getLoopbackReasons(): Set<string>;
    getNoiseSuppression(): boolean;
    getAutomaticGainControl(): boolean;
    getBypassSystemInputProcessing(): boolean;
    getNoiseCancellation(): boolean;
    getHardwareEncoding(): boolean;
    getEnableSilenceWarning(): boolean;
    getDebugLogging(): boolean;
    getQoS(): boolean;
    getAttenuation(): number;
    getAttenuateWhileSpeakingSelf(): boolean;
    getAttenuateWhileSpeakingOthers(): boolean;
    getAudioSubsystem(): string;
    getMLSSigningKey(param1: any, param2: any): Promise<any>;
    getActiveInputProfile(): string | null;
    isInputProfileCustom(): boolean;
    getSettings(context?: string): MediaEngineStore.AudioSettings;
    getState(): MediaEngineStore.MediaEngineState;
    getInputDetected(): boolean | null;
    getNoInputDetectedNotice(): boolean;
    getPacketDelay(): number;
    setCanHavePriority(userId: string, priority: boolean): void;
    isInteractionRequired(): boolean;
    getVideoHook(): boolean;
    supportsVideoHook(): boolean;
    getExperimentalSoundshare(): boolean;
    supportsExperimentalSoundshare(): boolean;
    supportsHookSoundshare(): boolean;
    getUseSystemScreensharePicker(): boolean;
    supportsSystemScreensharePicker(): boolean;
    getUseVaapiEncoder(): boolean;
    getUseGamescopeCapture(): boolean;
    getEverSpeakingWhileMuted(): boolean;
    getSpeakingWhileMuted(): boolean;
    getKrispModelOverride(): string | null;
    getKrispModels(): string[];
    getKrispVadActivationThreshold(): number;
    hasActiveCallKitCall(): boolean;
    setHasActiveCallKitCall(active: boolean): void;
    supportsScreenSoundshare(): boolean;
    getSystemMicrophoneMode(): string | undefined;
    getVideoStreamParameters(context?: string): any[];
    fetchAsyncResources(): Promise<any>;
    startDavePreload(): void;
    getSupportedSecureFramesProtocolVersion(): number;
    hasClipsSource(): boolean;
    getGpuBrand(): string | null;
}
