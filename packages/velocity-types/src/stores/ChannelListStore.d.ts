import { FluxStore } from "..";

export namespace ChannelListStore {
    export interface GuildChannels {
        guildChannelsVersion: number;
        guildChannels: any;
    }
}

export class ChannelListStore extends FluxStore {
    getGuild(guildId: string, options?: { guildActionRows?: any; channelNoticeRows?: any; }): ChannelListStore.GuildChannels;
    getGuildWithoutChangingGuildActionRows(guildId: string): ChannelListStore.GuildChannels;
    recentsChannelCount(guildId: string | null): number;
}
