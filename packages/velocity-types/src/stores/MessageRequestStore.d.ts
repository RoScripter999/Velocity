import { FluxStore } from "..";

export class MessageRequestStore extends FluxStore {
    getMessageRequestChannelIds(): Set<string>;
    getMessageRequestsCount(): number;
    isMessageRequest(channelId: string): boolean;
    isAcceptedOptimistic(channelId: string): boolean;
    getUserCountryCode(): string | null;
    isReady(): boolean;
}
