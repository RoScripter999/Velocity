import { FluxStore } from "..";

export namespace DispatchApplicationStore {
    export interface LaunchOption {
        id: string;
        name: string;
        executable: string;
        platforms: string[];
        working_dir?: string;
        fullExecutablePath: string;
        fullWorkingDir: string;
        [key: string]: any;
    }

    export interface ApplicationState {
        type: string;
        applicationId: string;
        branchId: string;
        buildId?: string;
        manifestIds?: string[];
        targetBuildId?: string;
        targetManifestIds?: string[];
        installPath?: string;
        installedSize?: number;
        launchOptions?: Record<string, LaunchOption>;
        defaultLaunchOptionId?: string;
        shouldPatch?: boolean;
        storage?: any;
        stage?: string;
        diskProgress?: number;
        networkProgress?: number;
        readerProgress?: number;
        progress?: number;
        total?: number;
        paused?: boolean;
    }

    export interface ProgressDatapoint {
        bytes: number;
        timestamp: number;
    }
}

export class DispatchApplicationStore extends FluxStore {
    /** Get application state */
    getState(applicationId: string, branchId: string): DispatchApplicationStore.ApplicationState | undefined;

    /** Check if application is up to date */
    isUpToDate(applicationId: string, branchId: string): boolean;

    /** Check if application should patch */
    shouldPatch(applicationId: string, branchId: string): boolean;

    /** Check if application is installed */
    isInstalled(applicationId: string, branchId: string): boolean;

    /** Check if application supports cloud sync */
    supportsCloudSync(applicationId: string, branchId?: string): boolean;

    /** Check if application is launchable */
    isLaunchable(applicationId: string, branchId: string): boolean;

    /** Get default launch option */
    getDefaultLaunchOption(applicationId: string, branchId: string): DispatchApplicationStore.LaunchOption | null;

    /** Get all launch options */
    getLaunchOptions(applicationId: string, branchId: string): DispatchApplicationStore.LaunchOption[];

    /** Get historical total bytes read */
    getHistoricalTotalBytesRead(): DispatchApplicationStore.ProgressDatapoint[];

    /** Get historical total bytes downloaded */
    getHistoricalTotalBytesDownloaded(): DispatchApplicationStore.ProgressDatapoint[];

    /** Get historical total bytes written */
    getHistoricalTotalBytesWritten(): DispatchApplicationStore.ProgressDatapoint[];

    /** Execute callback when store is initialized */
    whenInitialized(callback: () => void): void;
}
