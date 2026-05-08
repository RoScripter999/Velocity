import { FluxStore } from "..";

export interface PendingUsage {
    key: string;
    timestamp: number;
}

export interface ApplicationCommand {
    id: string;
    guildId?: string;
    [key: string]: any;
}

export interface Context {
    guild?: {
        id: string;
    };
}

export class ApplicationCommandFrecencyStore extends FluxStore {
    getState(): { pendingUsages: PendingUsage[]; };
    hasPendingUsage(): boolean;
    getCommandFrecencyWithoutLoadingLatest(): any;
    getScoreWithoutLoadingLatest(context: Context, command: ApplicationCommand): number;
    getTopCommandsWithoutLoadingLatest(): any[];
}
