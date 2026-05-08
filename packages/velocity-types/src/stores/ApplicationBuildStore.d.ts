import { FluxStore } from "..";

export class ApplicationBuildStore extends FluxStore {
    getTargetBuildId(applicationId: string, branchId: string): string | null;
    getTargetManifests(applicationId: string, branchId: string): string[] | null;
    hasNoBuild(applicationId: string, branchId: string): boolean;
    isFetching(applicationId: string, branchId: string): boolean;
    needsToFetchBuildSize(buildId: string): boolean;
    getBuildSize(buildId: string): number | undefined;
}
