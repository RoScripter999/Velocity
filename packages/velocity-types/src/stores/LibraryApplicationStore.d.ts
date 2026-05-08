import { FluxStore } from "..";

export namespace LibraryApplicationStore {
    export interface LibraryApplication {
        id: string;
        branchId: string;
        flags?: number;
        isHidden(): boolean;
        [key: string]: any;
    }
}

export class LibraryApplicationStore extends FluxStore {
    /** Get all non-hidden library applications */
    get libraryApplications(): Record<string, LibraryApplicationStore.LibraryApplication>;

    /** Get all library applications including hidden ones */
    getAllLibraryApplications(): Record<string, LibraryApplicationStore.LibraryApplication>;

    /** Check if there are any library applications */
    hasLibraryApplication(): boolean;

    /** Check if user has a specific application */
    hasApplication(applicationId: string, branchId: string, includeHidden?: boolean): boolean;

    /** Get a specific library application */
    getLibraryApplication(applicationId: string, branchId: string, includeHidden?: boolean): LibraryApplicationStore.LibraryApplication | undefined;

    /** Get the active library application for an application ID */
    getActiveLibraryApplication(applicationId: string, includeHidden?: boolean): LibraryApplicationStore.LibraryApplication | undefined;

    /** Check if flags are being updated for an application */
    isUpdatingFlags(applicationId: string, branchId: string): boolean;

    /** Get the active launch option ID for an application */
    getActiveLaunchOptionId(applicationId: string, branchId: string): string | undefined;

    /** Check if library applications have been fetched */
    get fetched(): boolean;

    /** Get all entitled branch IDs */
    get entitledBranchIds(): string[];

    /** Check if a library application was removed this session */
    get hasRemovedLibraryApplicationThisSession(): boolean;

    /** Execute callback when store is initialized */
    whenInitialized(callback: () => void): void;
}
