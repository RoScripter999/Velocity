import { FluxStore } from "..";

export namespace SelectedChannelStore {
    export interface ChannelFollowingDestination {
        guildId?: string;
        channelId?: string;
    }
}

export class SelectedChannelStore extends FluxStore {
    getChannelId(guildId?: string | null, returnDefault?: boolean): string;
    getVoiceChannelId(): string | null;
    getCurrentlySelectedChannelId(guildId?: string): string | undefined;
    getMostRecentSelectedTextChannelId(guildId: string): string | undefined;
    getLastSelectedChannelId(guildId?: string): string | undefined;
    getLastSelectedChannels(guildId?: string): Record<string, string>;
    getLastChannelFollowingDestination(): SelectedChannelStore.ChannelFollowingDestination | undefined;
}
