import { FluxStore } from "..";

export enum GuildOnboardingStatus {
    STARTED = "started",
    READY = "ready",
    COMPLETED = "completed",
    NOT_APPLICABLE = "not_applicable",
}

export class GuildOnboardingStore extends FluxStore {
    shouldShowOnboarding(guildId: string): boolean;
    getOnboardingStatus(guildId: string): GuildOnboardingStatus | undefined;
    resetOnboardingStatus(guildId: string): void;
    getCurrentOnboardingStep(guildId: string): string;
}
