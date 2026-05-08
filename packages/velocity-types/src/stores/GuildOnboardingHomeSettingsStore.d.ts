import { FluxStore } from "..";

export namespace GuildOnboardingHomeSettingsStore {
    export interface NewMemberAction {
        channelId: string;
        [key: string]: any;
    }

    export interface ResourceChannel {
        channelId: string;
        [key: string]: any;
    }

    export interface HomeSettings {
        enabled: boolean;
        newMemberActions?: NewMemberAction[];
        resourceChannels?: ResourceChannel[];
        welcomeMessage?: any;
    }
}

export const DEFAULT_HOME_SETTINGS: GuildOnboardingHomeSettingsStore.HomeSettings;

export class GuildOnboardingHomeSettingsStore extends FluxStore {
    /** Get home settings for a guild */
    getSettings(guildId: string | null): GuildOnboardingHomeSettingsStore.HomeSettings | null;

    /** Get new member actions for a guild */
    getNewMemberActions(guildId: string | null): GuildOnboardingHomeSettingsStore.NewMemberAction[] | null;

    /** Get action for a specific channel */
    getActionForChannel(guildId: string, channelId: string): GuildOnboardingHomeSettingsStore.NewMemberAction | undefined;

    /** Check if guild has an action for a channel */
    hasMemberAction(guildId: string, channelId: string): boolean;

    /** Get resource channels for a guild */
    getResourceChannels(guildId: string): GuildOnboardingHomeSettingsStore.ResourceChannel[];

    /** Get resource for a specific channel */
    getResourceForChannel(guildId: string, channelId: string): GuildOnboardingHomeSettingsStore.ResourceChannel | undefined;

    /** Check if settings are loading for a guild */
    getIsLoading(guildId: string): boolean;

    /** Get welcome message for a guild */
    getWelcomeMessage(guildId: string): any;

    /** Check if guild has settings */
    hasSettings(guildId: string): boolean;

    /** Check if onboarding is enabled for a guild */
    getEnabled(guildId: string): boolean;

    /** Get new member action for a channel */
    getNewMemberAction(guildId: string, channelId: string): GuildOnboardingHomeSettingsStore.NewMemberAction | null;
}
