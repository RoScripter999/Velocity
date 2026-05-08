import { FluxStore } from "..";

export namespace InstallationManagerStore {
    export interface Installation {
        installationPath: string;
    }

    export interface InstallationLocation {
        path: string;
        label?: string;
    }

    export interface State {
        installations: Record<string, Record<string, Installation>>;
        installationPaths: Set<string>;
        pathLabels: Record<string, string>;
        defaultInstallationPath: string;
    }
}

export class InstallationManagerStore extends FluxStore {
    /** Get current state */
    getState(): InstallationManagerStore.State;

    /** Get default installation path */
    get defaultInstallationPath(): string;

    /** Get all installation paths */
    get installationPaths(): InstallationManagerStore.InstallationLocation[];

    /** Get metadata for installation paths */
    get installationPathsMetadata(): Record<string, any>;

    /** Check if games are installed in a path */
    hasGamesInstalledInPath(path: string): boolean;

    /** Check if an application should be installed */
    shouldBeInstalled(applicationId: string, branchId: string): boolean;

    /** Get installation path for an application */
    getInstallationPath(applicationId: string, branchId: string): string | null;

    /** Get label for a path */
    getLabelFromPath(path: string): string;
}
