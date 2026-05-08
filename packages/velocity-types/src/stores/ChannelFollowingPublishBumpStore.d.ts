import { FluxStore } from "..";

export class ChannelFollowingPublishBumpStore extends FluxStore {
    shouldShowBump(messageId: string): boolean;
}
