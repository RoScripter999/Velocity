import { FluxStore } from "..";

export namespace ChannelFollowerStatsStore {
    export interface FollowerStats {
        loadingStatus: "succeeded" | "failed";
        lastFetched: number;
        channelsFollowing: number;
        guildMembers: number;
        guildsFollowing: number;
        usersSeenEver: number;
        subscribersGainedSinceLastPost: number;
        subscribersLostSinceLastPost: number;
    }
}

export class ChannelFollowerStatsStore extends FluxStore {
    getFollowerStatsForChannel(channelId: string): ChannelFollowerStatsStore.FollowerStats | undefined;
}
