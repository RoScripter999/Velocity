import { FluxStore } from "..";

export class ExpandedGuildFolderStore extends FluxStore {
    /** Get current state */
    getState(): {
        expandedFolders: string[];
    };

    /** Get all expanded folder IDs */
    getExpandedFolders(): Set<string>;

    /** Check if a folder is expanded */
    isFolderExpanded(folderId: string): boolean;
}
