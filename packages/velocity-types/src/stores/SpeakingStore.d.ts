import { FluxStore } from "..";

export class SpeakingStore extends FluxStore {
    getSpeakingDuration(userId: string, currentTime: number, context?: number): number;
    getSpeakers(context?: number): string[];
    isSpeaking(userId: string, context?: number): boolean;
    isPrioritySpeaker(userId: string, context?: number): boolean;
    isSoundSharing(userId: string, context?: number): boolean;
    isAnyoneElseSpeaking(context?: number): boolean;
    isCurrentUserSpeaking(context?: number): boolean;
    isCurrentUserPTTActive(): boolean;
    isCurrentUserPTTLatched(): boolean;
    isAnyonePrioritySpeaking(context?: number): boolean;
    isCurrentUserPrioritySpeaker(context?: number): boolean;
    isCurrentUserPrioritySpeaking(context?: number): boolean;
    getVoiceVolume(userId: string, context?: number): number;
}
