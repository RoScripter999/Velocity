import type { FluxStore } from "..";

export class MessageReactionsStore extends FluxStore {
    getReactions(channelId: string, messageId: string, emoji: any, limit: number, reactionType: string): Map<string, any>;
}
