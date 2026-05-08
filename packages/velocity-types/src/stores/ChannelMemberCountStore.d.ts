import { FluxStore } from "..";

export namespace ChannelMemberCountStore {
    export interface MemberCount {
        online: number | null;
        total: number | null;
    }

    export interface State {
        [channelId: string]: MemberCount;
    }
}

export class ChannelMemberCountStore extends FluxStore {
    getState(): ChannelMemberCountStore.State;
    getMemberCount(channelId: string): ChannelMemberCountStore.MemberCount;
    requestCount(guildId: string, channelId: string): void;
}
