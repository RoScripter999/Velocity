import { FluxStore } from "..";

export interface ActiveChannelMessage {
    id: string;
    userId: string;
}

export interface ActiveChannelsFetchStatus {
    loading: boolean;
    error: any | null;
    fetchedAt: number | null;
}

export class ActiveChannelsStore extends FluxStore {
    getActiveChannelsFetchStatus(guildId: string): ActiveChannelsFetchStatus | undefined;
    getActiveChannelIds(guildId: string): Set<string> | undefined;
    getChannelMessageData(channelId: string): ActiveChannelMessage[] | undefined;
    shouldFetch(guildId: string): boolean;
}
