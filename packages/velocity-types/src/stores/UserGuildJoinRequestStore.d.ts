import { FluxStore } from "..";

export namespace UserGuildJoinRequestStore {
    export interface JoinRequest {
        joinRequestId: string;
        guildId: string;
        userId: string;
        user: any;
        createdAt: string;
        formResponses: any[];
        rejectionReason?: string;
        applicationStatus: string;
        actionedAt?: string;
        actionedByUser?: any;
        lastSeen?: string;
        interviewChannelId?: string;
    }

    export interface Guild {
        id: string;
        name: string;
        icon?: string;
        features: string[];
        splash?: string;
    }
}

export class UserGuildJoinRequestStore extends FluxStore {
    getRequest(guildId: string): UserGuildJoinRequestStore.JoinRequest | undefined;
    computeGuildIds(): string[];
    getJoinRequestGuild(guildId: string): UserGuildJoinRequestStore.Guild | null;
    get hasFetchedRequestToJoinGuilds(): boolean;
    hasJoinRequestCoackmark(): boolean;
    getCooldown(guildId: string): number;
}
