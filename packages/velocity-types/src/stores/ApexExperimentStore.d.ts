import { FluxStore } from "..";

export interface ExperimentAssignment {
    hashedName: string;
    variantId: number;
    trackedVariantId?: number;
    isOverride: boolean;
    revision: number;
    exposureTrackingEnabled: boolean;
}

export interface ExperimentEvaluation {
    evaluationId?: string;
    assignments: Record<string, ExperimentAssignment>;
}

export interface ExperimentMetadata {
    name: string;
    [key: string]: any;
}

export interface ExperimentState {
    version: number;
    evaluatedExperiments: {
        user: Record<string, ExperimentEvaluation>;
        guild: Record<string, ExperimentEvaluation>;
    };
    clientOverrides: Record<string, ExperimentAssignment>;
}

export class ApexExperimentStore extends FluxStore {
    getState(): ExperimentState;
    setExperimentAssignments(assignments: any): boolean;
    createOverride(experimentName: string, variantId: number): void;
    deleteOverride(experimentName: string): void;
    setExperimentsMetadata(metadata: ExperimentMetadata[]): void;
    getExperimentsMetadata(): Record<string, ExperimentMetadata>;
    getClientOverrides(): Record<string, ExperimentAssignment>;
    getExperimentClientOverride(experimentName: string): ExperimentAssignment | undefined;
    getAssignment(scope: string, location: string, experimentName: string): ExperimentAssignment | undefined;
    getServerAssignment(scope: string, location: string, experimentName: string): ExperimentAssignment | undefined;
    getEvaluation(scope: string, location: string): string | undefined;
    getEvaluationAndAssignment(scope: string, location: string, experimentName: string): [string | undefined, ExperimentAssignment | undefined];
    trackExperimentExposure(evaluationId: string, experiment: string, exposureLocation: string, unitType: string, trackedVariationId: string, variantId: number): void;
    trackCommonTriggerPointExposures(exposureLocation: string): void;
    trackExposureSuppression(experimentName: string, suppressionSource: string): void;
    evaluationIds(scope: string): (string | undefined)[];
    shouldTrackExposure(exposureKey: string): boolean;
    loadTrackedExposures(): Record<string, number>;
    saveTrackedExposures(exposures: Record<string, number>): void;
    clearForTests(): void;
    clearAllServerAssignments(): void;
    clearAllOverrides(): void;
    clearAllTrackedExposures(): void;
    getHash(input: string): string;
    handleFetchStart(scope: string): void;
    handleFetchSuccess(scope: string, assignments: any): void;
    handleFetchFailure(scope: string): void;
    isFetching(scope: string): boolean;
    hasLoaded(scope: string): boolean;
}
