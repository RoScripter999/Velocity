import { FluxStore } from "..";

export class ChannelSKUStore extends FluxStore {
    /** Get SKU ID for a channel */
    getSkuIdForChannel(channelId: string): string | undefined;
}
