import { FluxStore } from "..";

export enum BurstReactionEffectType {
    HOVER = "HOVER",
    EXTERNAL = "EXTERNAL",
    RANDOM = "RANDOM"
}

export class BurstReactionEffectsStore extends FluxStore {
    getReactionPickerAnimation(messageId: string, emojiName: string, emojiId?: string): number | undefined;
    getEffectForEmojiId(channelId: string, messageId: string, emoji: object): BurstReactionEffectType | undefined;
}
