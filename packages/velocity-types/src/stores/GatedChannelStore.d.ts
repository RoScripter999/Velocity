import { FluxStore } from "..";

export class GatedChannelStore extends FluxStore {
    /** Check if a channel is gated (requires role subscription) */
    isChannelGated(guildId: string | null, channelId: string): boolean;

    /** Check if a channel is gated and visible */
    isChannelGatedAndVisible(guildId: string | null, channelId: string): boolean;

    /** Check if a channel or its thread parent is gated */
    isChannelOrThreadParentGated(guildId: string | null, channelId: string): boolean;
}
