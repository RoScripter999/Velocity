import { FluxStore } from "..";

export namespace DeveloperExperimentStore {
    export interface ExperimentDescriptor {
        type: string;
        name: string;
        revision: number;
        override: boolean;
        bucket: number;
    }
}

export class DeveloperExperimentStore extends FluxStore {
    /** Check if current user is a developer */
    get isDeveloper(): boolean;

    /** Get developer experiment descriptor */
    getExperimentDescriptor(): DeveloperExperimentStore.ExperimentDescriptor | null;
}
