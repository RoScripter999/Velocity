import { FluxStore } from "..";

export namespace UserSettingsProtoStore {
    export interface GuildFolder {
        guildIds: string[];
        folderId?: number;
        folderName?: string;
        folderColor?: number;
    }

    export interface DismissedGuildContent {
        [key: string]: any;
    }

    export interface GuildDismissibleContentState {
        [key: string]: any;
    }

    export interface ProtoState {
        proto: string;
        protoToSave?: string;
        offlineEditDataVersion?: number;
    }

    export interface EditInfo {
        loaded: boolean;
        loading: boolean;
        timeout?: NodeJS.Timeout;
        timeoutDelay: number;
        rateLimited: boolean;
        offlineEditDataVersion: number | null;
        protoToSave?: any;
        triggeredMigrations: boolean;
        cleanupFuncs: Array<() => void>;
    }

    export interface FullState {
        [settingType: number]: {
            proto: any;
            lazyLoaded: boolean;
            editInfo: EditInfo;
        };
    }
}

export class UserSettingsProtoStore extends FluxStore {
    getState(): Record<number, UserSettingsProtoStore.ProtoState>;
    computeState(): Record<number, UserSettingsProtoStore.ProtoState>;
    hasLoaded(settingType: number): boolean;
    get settings(): any;
    get frecencyWithoutFetchingLatest(): any;
    get wasMostRecentUpdateFromServer(): boolean;
    getFullState(): UserSettingsProtoStore.FullState;
    getGuildFolders(): UserSettingsProtoStore.GuildFolder[] | null;
    getGuildRecentsDismissedAt(guildId: string | null): number;
    getDismissedGuildContent(guildId: string | null): UserSettingsProtoStore.DismissedGuildContent | null;
    getGuildDismissedContentState(guildId: string | null): Record<string, any> | undefined;
    getGuildsProto(): any;
}
