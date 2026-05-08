import { FluxStore } from "..";

export namespace ApplicationViewStore {
    export interface ApplicationViewItem {
        key: string;
        application: any;
        libraryApplication?: any;
        lastPlayed: number;
        supportsCloudSync: boolean;
        isNew: boolean;
        isLaunching: boolean;
        isRunning: boolean;
        isLaunchable: boolean;
        isUpdatingFlags: boolean;
        shouldShowInLibrary: boolean;
        defaultAction?: any;
    }
}

export class ApplicationViewStore extends FluxStore {
    get applicationFilterQuery(): string;
    get applicationViewItems(): ApplicationViewStore.ApplicationViewItem[];
    get launchableApplicationViewItems(): ApplicationViewStore.ApplicationViewItem[];
    get libraryApplicationViewItems(): ApplicationViewStore.ApplicationViewItem[];
    get filteredLibraryApplicationViewItems(): ApplicationViewStore.ApplicationViewItem[];
    get sortedFilteredLibraryApplicationViewItems(): ApplicationViewStore.ApplicationViewItem[];
    get hiddenLibraryApplicationViewItems(): ApplicationViewStore.ApplicationViewItem[];
    get hasFetchedApplications(): boolean;
}
