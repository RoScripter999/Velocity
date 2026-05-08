import { FluxStore } from "..";

export enum ChannelSectionType {
    VIEW_CHANNEL = 1,
    VIEW_THREAD = 2,
    VIEW_MESSAGE_REQUEST = 3,
    VIEW_MOD_REPORT = 4,
    CREATE_THREAD = 5,
}

export enum ChannelSection {
    NONE = 0,
    MEMBERS = 1,
    SUMMARIES = 2,
    PROFILE = 3,
    SIDEBAR_CHAT = 4,
    SEARCH = 5,
}

export namespace ChannelSectionStore {
    export interface SidebarState {
        type: ChannelSectionType;
        channelId?: string;
        parentChannelId?: string;
        parentMessageId?: string;
        baseChannelId?: string;
        location?: string;
        details?: {
            initialMessageId?: string;
        };
    }

    export interface GuildSidebarState {
        type: ChannelSectionType;
        baseChannelId: string;
        guildId: string;
        details?: any;
    }

    export interface State {
        isMembersOpen: boolean;
        isSummariesOpen: boolean;
        isProfileOpen: boolean;
        sidebars: Record<string, SidebarState>;
        guildSidebars: Record<string, GuildSidebarState>;
    }
}

export class ChannelSectionStore extends FluxStore {
    getState(): ChannelSectionStore.State;
    getSection(channelId: string, hasSelectedGuild: boolean): ChannelSection;
    getSidebarState(channelId: string): ChannelSectionStore.SidebarState | undefined;
    getGuildSidebarState(guildId: string | null): ChannelSectionStore.GuildSidebarState | undefined;
    getCurrentSidebarChannelId(channelId: string): string | null;
    getCurrentSidebarMessageId(channelId: string): string | null;
    getCurrentSearchContextId(): string | null;
}
