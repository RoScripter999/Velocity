import { FluxStore } from "..";

export namespace UserGuildSettingsStore {
    export interface ChannelOverride {
        channel_id: string;
        muted: boolean;
        message_notifications?: number;
        suppress_everyone?: boolean;
        suppress_roles?: boolean;
        mute_config?: any;
        flags?: number;
    }

    export interface UserGuildSettings {
        guild_id: string;
        suppress_everyone: boolean;
        suppress_roles: boolean;
        mute_scheduled_events: boolean;
        mobile_push: boolean;
        muted: boolean;
        message_notifications: number;
        flags: number;
        channel_overrides: Record<string, ChannelOverride>;
        notify_highlights: number;
        hide_muted_channels: boolean;
        version: number;
        mute_config: any;
    }

    export interface NotificationSettings {
        flags: number;
    }
}

export class UserGuildSettingsStore extends FluxStore {
    isSuppressEveryoneEnabled(guildId: string): boolean;
    isSuppressRolesEnabled(guildId: string): boolean;
    isMuteScheduledEventsEnabled(guildId: string): boolean;
    isMobilePushEnabled(guildId: string): boolean;
    isMuted(guildId: string): boolean;
    isTemporarilyMuted(guildId: string): boolean;
    getMuteConfig(guildId: string): any;
    getMessageNotifications(guildId: string): number;
    getChannelOverrides(guildId: string): Record<string, UserGuildSettingsStore.ChannelOverride>;
    getNotifyHighlights(guildId: string): number;
    getGuildFlags(guildId: string): number;
    getChannelMessageNotifications(guildId: string, channelId: string): number;
    getChannelMuteConfig(guildId: string, channelId: string): any;
    getMutedChannels(guildId: string): Set<string>;
    isChannelMuted(guildId: string, channelId: string): boolean;
    isCategoryMuted(guildId: string, channelId: string): boolean;
    isGuildOrCategoryOrChannelMuted(guildId: string, channelId: string): boolean;
    resolvedMessageNotifications(channel: any): number;
    resolveUnreadSetting(channel: any): number;
    allowNoMessages(channel: any): boolean;
    allowAllMessages(channel: any): boolean;
    isGuildCollapsed(guildId: string): boolean;
    getAllSettings(): { userGuildSettings: Record<string, UserGuildSettingsStore.UserGuildSettings>; mutedChannels: Record<string, Set<string>>; optedInChannelsByGuild: Record<string, Set<string>>; };
    getChannelIdFlags(guildId: string, channelId: string): number;
    getChannelFlags(channel: any): number;
    getNewForumThreadsCreated(channel: any): boolean;
    isOptInEnabled(guildId: string): boolean;
    isChannelRecordOrParentOptedIn(channel: any, useCache?: boolean): boolean;
    isChannelOrParentOptedIn(guildId: string, channelId: string, useCache?: boolean): boolean;
    isChannelOptedIn(guildId: string, channelId: string, useCache?: boolean): boolean;
    getOptedInChannels(guildId: string): Set<string>;
    getOptedInChannelsWithPendingUpdates(guildId: string): Set<string> | undefined;
    getPendingChannelUpdates(guildId: string): Record<string, any> | undefined;
    getGuildFavorites(guildId: string): string[] | null;
    isFavorite(guildId: string, channelId: string): boolean;
    isMessagesFavorite(channelId: string): boolean;
    isAddedToMessages(channelId: string): boolean;
    getAddedToMessages(): Set<string>;
    get accountNotificationSettings(): UserGuildSettingsStore.NotificationSettings;
    get useNewNotifications(): boolean;
    getGuildUnreadSetting(guildId: string): number;
    resolveGuildUnreadSetting(guild: any): number;
    getChannelRecordUnreadSetting(channel: any): number;
    getChannelUnreadSetting(guildId: string, channelId: string): number;
}
