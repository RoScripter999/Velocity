import { FluxStore } from "..";

export namespace ChangelogStore {
    export interface Changelog {
        id: string;
        date: number;
        body: string;
        revision: number;
        locale: string;
        youtube_video_id?: string;
        image?: string;
    }

    export interface ChangelogConfig {
        [changelogId: string]: {
            min_version: number;
            show_on_startup: boolean;
            // TODO: this is not fully typed yet.
            [key: string]: any;
        };
    }

    export interface State {
        changelogConfig: ChangelogConfig | null;
        loadedChangelogs: Record<string, Record<string, Changelog>>;
        lastSeenChangelogId: string | null;
        lastSeenChangelogDate: Date | null;
        lockedKeys: Set<string>;
    }
}

export class ChangelogStore extends FluxStore {
    /** Get a specific changelog by ID and locale */
    getChangelog(id: string, locale: string): ChangelogStore.Changelog | null;

    /** Get the latest changelog ID */
    latestChangelogId(): string | null;

    /** Get the load status for a specific changelog */
    getChangelogLoadStatus(id: string, locale: string): number;

    /** Check if the changelog config has been loaded */
    hasLoadedConfig(): boolean;

    /** Get the changelog configuration */
    getConfig(): ChangelogStore.ChangelogConfig | null;

    /** Get the override ID if set */
    overrideId(): string | null;

    /** Get the last seen changelog ID */
    lastSeenChangelogId(): string | null;

    /** Get the last seen changelog date */
    lastSeenChangelogDate(): Date | null;

    /** Get state for debugging purposes */
    getStateForDebugging(): {
        changelogConfig: ChangelogStore.ChangelogConfig | null;
        loadedChangelogs: Record<string, Record<string, ChangelogStore.Changelog>>;
        lastSeenChangelogId: string | null;
        lastSeenChangelogDate: Date | null;
    };

    /** Check if the store is currently locked (fetching data) */
    isLocked(): boolean;
}
