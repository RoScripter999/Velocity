import { FluxStore } from "..";

export namespace GuildOnboardingMemberActionStore {
    export interface State {
        completedActions: Record<string, boolean>;
        loading: boolean;
    }
}

export class GuildOnboardingMemberActionStore extends FluxStore {
    /** Get completed actions for a guild */
    getCompletedActions(guildId: string): Record<string, boolean> | null;

    /** Check if completed action for a channel */
    hasCompletedActionForChannel(guildId: string, channelId: string): boolean;

    /** Get state for a guild */
    getState(guildId: string): GuildOnboardingMemberActionStore.State;
}
