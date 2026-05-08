import { FluxStore } from "..";

export class ApplicationStreamPreviewStore extends FluxStore {
    getPreviewURL(guildId: string | null | undefined, channelId: string, ownerId: string): string | null;
    shouldFetchPreview(guildId: string | null | undefined, channelId: string, ownerId: string): boolean;
    getPreviewURLForStreamKey(streamKey: string): string | null;
    getIsPreviewLoading(guildId: string | null | undefined, channelId: string, ownerId: string): boolean;
}
