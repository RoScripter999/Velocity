import { FluxStore } from "..";


export interface GuildFolder {
    folderId: string;
    folderName?: string;
    folderColor?: number;
    expanded?: boolean;
    guildIds: string[];
}

export interface GuildsTreeNode {
    id: string;
    type: number;
    name?: string;
    color?: number;
    expanded?: boolean;
    children: GuildsTreeNode[];
    parentId?: string;
}
export namespace SortedGuildStore {


    export interface Snapshot {
        version: number;
        data: {
            tree: any;
        };
    }
}

export class SortedGuildStore extends FluxStore {
    getGuildsTree(): any;
    getGuildFolders(): SortedGuildStore.GuildFolder[];
    getGuildFolderById(folderId: string): SortedGuildStore.GuildFolder | undefined;
    getFlattenedGuildIds(): string[];
    getFlattenedGuildFolderList(): any[];
    getCompatibleGuildFolders(): SortedGuildStore.GuildFolder[];
    getFastListGuildFolders(): any[];
    takeSnapshot(): SortedGuildStore.Snapshot;
}
