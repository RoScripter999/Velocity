import { FluxStore } from "..";

export namespace CallChatToastsStore {
    export interface State {
        toastsEnabledForChannel: Record<string, boolean>;
    }
}

export class CallChatToastsStore extends FluxStore {
    getToastsEnabled(channelId: string): boolean;
    getState(): CallChatToastsStore.State;
}
