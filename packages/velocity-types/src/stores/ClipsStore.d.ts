import { FluxStore } from "..";

export namespace ClipsStore {
    export interface ClipsSettings {
        clipsEnabled: boolean;
        storageLocation: string;
        clipsQuality: {
            resolution: number;
            frameRate: number;
        };
        clipsLength: number;
        remindersEnabled: boolean;
        decoupledClipsEnabled: boolean;
        viewerClipsEnabled: boolean;
        viewerConnectivity: string;
        maxAutoClips: number;
        clipSignals: {
            enableDistributedSignals: boolean;
            enablePhraseSignals: boolean;
            enableGameSignals: boolean;
        };
        mlPipelinesEnabled: {
            emotionClassifier: boolean;
            wakeWordDetector: boolean;
            yellDetector: boolean;
            whisperTranscription: boolean;
        };
        autoClipPhrases: string[];
    }

    export interface Clip {
        id: string;
        filepath: string;
        applicationName: string;
        [key: string]: any;
    }

    export interface ClipsSession {
        applicationName: string;
        newClipIds: string[];
        ended: boolean;
    }

    export interface StreamAnimation {
        timestamp: number;
        thumbnail: string;
    }

    export interface ClipsEducationState {
        dismissedAt: number | null;
        numberOfGamesLaunchedSinceDismissal: number;
        numberOfTimesDismissed: number;
    }

    export interface State {
        clipsSettings: ClipsSettings;
        hardwareClassification: string | null;
        hardwareClassificationForDecoupled: string | null;
        hardwareClassificationVersion: number;
        newClipIds: string[];
        hasClips: boolean;
        hasTakenDecoupledClip: boolean;
        clipsEducationState: ClipsEducationState;
    }
}

export class ClipsStore extends FluxStore {
    /** Get all clips */
    getClips(): ClipsStore.Clip[];

    /** Get pending clips */
    getPendingClips(): ClipsStore.Clip[];

    /** Get user agnostic state */
    getUserAgnosticState(): ClipsStore.State;

    /** Get clips settings */
    getSettings(): ClipsStore.ClipsSettings;

    /** Get last clips session */
    getLastClipsSession(): ClipsStore.ClipsSession | null;

    /** Check if clips warning was shown for a channel */
    getClipsWarningShown(channelId: string): boolean;

    /** Get active animation */
    getActiveAnimation(): number | null;

    /** Get stream clip animations for a stream key */
    getStreamClipAnimations(streamKey: string): ClipsStore.StreamAnimation[];

    /** Check if there are any clip animations */
    hasAnyClipAnimations(): boolean;

    /** Get hardware classification */
    getHardwareClassification(): string | null;

    /** Get hardware classification for decoupled */
    getHardwareClassificationForDecoupled(): string | null;

    /** Get hardware classification version */
    getHardwareClassificationVersion(): number;

    /** Check if at max save clip operations */
    getIsAtMaxSaveClipOperations(): boolean;

    /** Get last clips error */
    getLastClipsError(): string | null;

    /** Check if clips are enabled for a user */
    isClipsEnabledForUser(userId: string): boolean;

    /** Check if voice recording is allowed for a user */
    isVoiceRecordingAllowedForUser(userId: string): boolean;

    /** Check if viewer clipping is allowed for a user */
    isViewerClippingAllowedForUser(userId: string): boolean;

    /** Check if user has clips */
    hasClips(): boolean;

    /** Check if user has taken a decoupled clip */
    hasTakenDecoupledClip(): boolean;

    /** Get new clip IDs */
    getNewClipIds(): string[];

    /** Check if a clip is exporting */
    isClipExporting(clipId: string): boolean;

    /** Get exporting clip IDs */
    getExportingClipIds(): string[];

    /** Get matching group clip */
    getMatchingGroupClip(remoteTriggerClipId: string | null, clipId: string | null): ClipsStore.Clip | null;

    /** Check if clip was shared in a channel */
    wasClipSharedInChannel(clipId: string, channelId: string): boolean;
}
