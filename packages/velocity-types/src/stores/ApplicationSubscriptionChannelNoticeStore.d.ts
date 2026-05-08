import { FluxStore } from "..";

export namespace ApplicationSubscriptionChannelNoticeStore {
    export interface State {
        lastGuildDismissedTime: Record<string, number>;
    }
}

export class ApplicationSubscriptionChannelNoticeStore extends FluxStore {
    getUserAgnosticState(): ApplicationSubscriptionChannelNoticeStore.State;
    getLastGuildDismissedTime(guildId: string): number | undefined;
}
