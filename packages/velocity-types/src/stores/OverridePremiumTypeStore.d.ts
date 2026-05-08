import { FluxStore } from "..";

export namespace OverridePremiumTypeStore {
    export interface State {
        premiumTypeOverride: string;
        premiumTypeActual: string;
        createdAtOverride: Date;
    }
}

export class OverridePremiumTypeStore extends FluxStore {
    /** Get the premium type override */
    getPremiumTypeOverride(): string;

    /** Get the actual premium type */
    getPremiumTypeActual(): string;

    /** Get the created at override */
    getCreatedAtOverride(): Date;

    /** Get current state */
    getState(): OverridePremiumTypeStore.State;

    /** Get premium type (override if set, otherwise actual) */
    get premiumType(): string;
}
