import { FluxStore } from "..";

export namespace StageInstanceStore {
    export interface StageInstance {
        channel_id: string;
        guild_id: string;
        privacy_level: number;
        [key: string]: any;
    }
}

export class StageInstanceStore extends FluxStore {
    /** Get stage instance for a channel */
    getStageInstanceByChannel(channelId: string): StageInstanceStore.StageInstance | undefined;

    /** Check if a channel has a live stage instance */
    isLive(channelId: string): boolean;

    /** Check if a stage instance is public */
    isPublic(channelId: string): boolean;

    /** Get all stage instances for a guild */
    getStageInstancesByGuild(guildId: string): Record<string, StageInstanceStore.StageInstance>;

    /** Get all stage instances */
    getAllStageInstances(): StageInstanceStore.StageInstance[];
}
