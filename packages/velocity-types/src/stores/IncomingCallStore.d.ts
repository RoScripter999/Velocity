import { FluxStore } from "..";

export namespace IncomingCallStore {
    export interface IncomingCall {
        channel: any;
        x: number;
        y: number;
    }
}

export class IncomingCallStore extends FluxStore {
    getIncomingCalls(): IncomingCallStore.IncomingCall[];
    getIncomingCallChannelIds(): Set<string>;
    getFirstIncomingCallId(): string | undefined;
    hasIncomingCalls(): boolean;
}
