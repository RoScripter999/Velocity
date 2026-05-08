import { FluxStore } from "..";

export class CollapsedVoiceChannelStore extends FluxStore {
    /** Get current state */
    getState(): Record<string, boolean>;

    /** Get all collapsed channels */
    getCollapsed(): Record<string, boolean>;

    /** Check if a channel is collapsed */
    isCollapsed(channelId: string): boolean;
}
