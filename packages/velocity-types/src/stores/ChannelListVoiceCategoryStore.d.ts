import { FluxStore } from "..";

export namespace ChannelListVoiceCategoryStore {
    export interface State {
        [guildId: string]: boolean;
    }
}

export class ChannelListVoiceCategoryStore extends FluxStore {
    isVoiceCategoryExpanded(guildId: string): boolean;
    isVoiceCategoryCollapsed(guildId: string): boolean;
    getState(): ChannelListVoiceCategoryStore.State;
}
