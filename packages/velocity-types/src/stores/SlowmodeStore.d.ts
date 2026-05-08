import { FluxStore } from "..";

export enum SlowmodeType {
    SendMessage = 0,
    CreateThread = 1
}

export class SlowmodeStore extends FluxStore {
    getSlowmodeCooldownGuess(channelId: string, slowmodeType?: SlowmodeType): number;
    isChannelOnCooldown(channel: any, slowmodeType?: SlowmodeType): boolean;
}
