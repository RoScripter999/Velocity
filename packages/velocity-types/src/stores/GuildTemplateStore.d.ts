import { FluxStore, Guild, User } from "..";

export namespace GuildTemplateStore {
    export interface GuildTemplate {
        code: string;
        state: string;
        name: string;
        description: string;
        creatorId: string;
        creator: User;
        createdAt: string;
        updatedAt: string;
        sourceGuildId: string;
        serializedSourceGuild: Guild;
        usageCount: number;
        isDirty: boolean | null;
    }

    export interface State {
        templates: Map<string, GuildTemplate>;
        displayedCode: string | null;
    }
}

export class GuildTemplateStore extends FluxStore {
    /** Get a guild template by code */
    c(code: string): GuildTemplateStore.GuildTemplate | undefined;

    /** Get all guild templates */
    getGuildTemplates(): Map<string, GuildTemplateStore.GuildTemplate>;

    /** Get guild template for a specific guild */
    getForGuild(guildId: string): GuildTemplateStore.GuildTemplate | undefined;

    /** Get the currently displayed guild template code */
    getDisplayedGuildTemplateCode(): string | null;
}
