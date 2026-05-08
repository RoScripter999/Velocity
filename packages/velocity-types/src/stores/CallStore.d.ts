import { FluxStore } from "..";

export namespace CallStore {
    interface Call {
        channelId: string;
        messageId: string | null;
        region: string | null;
        ringing: string[];
        unavailable: boolean;
        regionUpdated: boolean;
    }

    interface State {
        calls: Record<string, Call>;
        enqueuedRings: Record<string, string[]>;
    }
}

export class CallStore extends FluxStore {
    getCall(channelId: string): CallStore.Call;
    getCalls(): CallStore.Call[];
    getMessageId(channelId: string): string | null;
    isCallActive(channelId: string, messageId?: string): boolean;
    isCallUnavailable(channelId: string): boolean;
    getInternalState(): CallStore.State;
}
