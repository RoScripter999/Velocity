import { FluxStore } from "..";

export enum GuildSettingsSection {
    OVERVIEW = 0,
    ROLES = 1,
    MEMBERS = 2,
    CHANNELS = 3,
    MODERATION = 4,
    INVITES = 5,
    INTEGRATIONS = 6,
    INSTANT_INVITES = 7,
    VANITY_URL = 8,
    SAFETY = 9,
}

export enum GuildSettingsUIState {
    CLOSED = 0,
    OPEN = 1,
    SUBMITTING = 2,
}

export namespace GuildSettingsStore {
    export interface GuildProfile {
        primaryCategoryId: string;
        secondaryCategoryIds: string[];
        keywords: string[];
        emojiDiscoverabilityEnabled: boolean;
        partnerActionedTimestamp?: string | null;
        partnerApplicationTimestamp?: string | null;
        isPublished: boolean;
        reasonsToJoin: string[];
        socialLinks: string[];
        about: string;
    }

    export interface Invite {
        code: string;
        temporary: boolean;
        revoked: boolean;
        inviter?: any;
        channel?: any;
        guild?: any;
        uses: number;
        maxUses: number;
        maxAge: number;
        createdAt: Date;
        flags: number;
    }

    export interface Ban {
        user: any;
        reason?: string | null;
    }
}

export class GuildSettingsStore extends FluxStore {
    getGuildId(): string | null;
    getGuild(): any | null;
    getSection(): GuildSettingsSection;
    getSubsection(): string | null;
    getErrors(): Record<string, any>;
    getUIState(): GuildSettingsUIState;
    getProfile(): GuildSettingsStore.GuildProfile | null;
    getInvites(): Record<string, GuildSettingsStore.Invite> | null;
    getBans(): Map<string, GuildSettingsStore.Ban>;
    isMFALevel(level: number): boolean;
}
