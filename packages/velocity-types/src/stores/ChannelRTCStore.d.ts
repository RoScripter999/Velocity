import { FluxStore } from "..";

export enum ChannelRTCMode {
    VOICE = 1,
    VIDEO = 2,
}

export enum ChannelRTCLayout {
    NORMAL = 1,
    NO_CHAT = 2,
    FULL_SCREEN = 3,
}

export enum ParticipantType {
    USER = 1,
    STREAM = 2,
    ACTIVITY = 3,
}

export namespace ChannelRTCStore {
    export interface Participant {
        id: string;
        type: ParticipantType;
        user?: any;
        ringing?: boolean;
        isPoppedOut?: boolean;
    }

    export interface SelectedParticipantStats {
        view_mode_grid_duration_ms: number;
        view_mode_focus_duration_ms: number;
        view_mode_toggle_count: number;
    }

    export interface State {
        voiceParticipantsHidden: Record<string, boolean>;
    }
}

export class ChannelRTCStore extends FluxStore {
    getState(): ChannelRTCStore.State;
    getParticipantsVersion(channelId: string): number;
    getParticipants(channelId: string): ChannelRTCStore.Participant[];
    getSpeakingParticipants(channelId: string): ChannelRTCStore.Participant[];
    getFilteredParticipants(channelId: string): ChannelRTCStore.Participant[];
    getVideoParticipants(channelId: string): ChannelRTCStore.Participant[];
    getStreamParticipants(channelId: string): ChannelRTCStore.Participant[];
    getActivityParticipants(channelId: string): ChannelRTCStore.Participant[];
    getParticipant(channelId: string, participantId: string): ChannelRTCStore.Participant | null;
    getUserParticipantCount(channelId: string): number;
    getParticipantsOpen(channelId: string): boolean;
    getVoiceParticipantsHidden(channelId: string): boolean;
    getSelectedParticipantId(channelId: string): string | null;
    getSelectedParticipant(channelId: string): ChannelRTCStore.Participant | null;
    getSelectedParticipantStats(channelId: string): ChannelRTCStore.SelectedParticipantStats;
    getGuildRingingUsers(channelId: string): Set<string>;
    getMode(channelId: string): ChannelRTCMode;
    getLayout(channelId: string, appContext?: number): ChannelRTCLayout;
    getChatOpen(channelId: string): boolean;
    getAllChatOpen(): Record<string, boolean>;
    getParticipantsListOpen(channelId: string): boolean;
    isFullscreenInContext(appContext?: number): boolean;
    getStageStreamSize(channelId: string): boolean | undefined;
    getStageVideoLimitBoostUpsellDismissed(channelId: string): boolean | undefined;
    isParticipantPoppedOut(channelId: string, participantId: string): boolean;
}
