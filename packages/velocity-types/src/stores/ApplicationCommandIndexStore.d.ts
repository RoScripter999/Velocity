import { FluxStore, Channel, Guild, User } from "..";

export namespace ApplicationCommandIndexStore {
    export enum CommandType {
        CHAT = 1,
        USER = 2,
        MESSAGE = 3
    }

    export interface ApplicationDescriptor {
        id: string;
        name: string;
        icon?: string;
        description: string;
        botId?: string;
        bot?: User;
        flags?: number;
        permissions?: PermissionOverwrite[];
    }

    export interface PermissionOverwrite {
        type: string;
        id: string;
        permission: string;
    }

    export interface IndexedApplicationCommand {
        id: string;
        applicationId: string;
        name: string;
        untranslatedName: string;
        displayName: string;
        description: string;
        untranslatedDescription: string;
        displayDescription: string;
        options?: CommandOption[];
        dm_permission?: boolean;
        permissions?: PermissionOverwrite[];
        score?: number;
        section?: ApplicationDescriptor;
    }

    export interface CommandOption {
        name: string;
        serverLocalizedName?: string;
        description: string;
        type: number;
        choices?: CommandChoice[];
        options?: CommandOption[];
    }

    export interface CommandChoice {
        name: string;
        name_default?: string;
        value: any;
    }

    export interface CommandSection {
        section: ApplicationDescriptor;
        data: IndexedApplicationCommand[];
    }

    export interface CommandIndexResult {
        descriptors: ApplicationDescriptor[];
        commands: IndexedApplicationCommand[];
        sectionedCommands: CommandSection[];
        loading: boolean;
    }

    export interface ContextState {
        serverVersion: any;
        fetchState: {
            fetching: boolean;
            abort?: AbortController;
            promise?: Promise<any>;
            retryAfter?: number;
        };
        result?: {
            sections: Record<string, { descriptor: ApplicationDescriptor; commands: Record<string, IndexedApplicationCommand>; }>;
            sectionIdsByBotId: Record<string, string>;
            version: any;
        };
    }

    export interface LauncherContext {
        type: "channel" | "guild" | "user" | "application" | "contextless";
        channel?: Channel;
        guildId?: string;
        applicationId?: string;
    }

    export interface QueryOptions {
        commandTypes?: CommandType[];
        text?: string;
        builtIns?: string;
        applicationCommands?: boolean;
        scoreMethod?: string;
        allowEmptySections?: boolean;
        allowApplicationState?: boolean;
        sortOptions?: Record<string, any>;
        allowFetch?: boolean;
        placeholderCount?: number;
        installOnDemand?: boolean;
    }
}

export class ApplicationCommandIndexStore extends FluxStore {
    getContextState(context: ApplicationCommandIndexStore.LauncherContext): ApplicationCommandIndexStore.ContextState;
    hasContextStateApplication(options: { applicationId: string; channelId?: string; guildId?: string; }): boolean;
    getGuildState(guildId?: string): ApplicationCommandIndexStore.ContextState;
    getUserState(): ApplicationCommandIndexStore.ContextState;
    hasUserStateApplication(applicationId: string): boolean;
    getApplicationState(applicationId?: string): ApplicationCommandIndexStore.ContextState;
    getApplicationStates(): Map<string, ApplicationCommandIndexStore.ContextState>;
    hasApplicationState(applicationId: string): boolean;
    query(context: ApplicationCommandIndexStore.LauncherContext, options: ApplicationCommandIndexStore.QueryOptions, queryOptions: any): ApplicationCommandIndexStore.CommandIndexResult;
    queryInstallOnDemandApp(applicationId: string, channelId: string): void;
}
