import { FluxStore } from "..";

export namespace MFAStore {
    export interface Nonces {
        viewNonce: string;
        regenerateNonce: string;
    }
}

export class MFAStore extends FluxStore {
    /** Get the verification key for MFA setup */
    getVerificationKey(): string;

    /** Get backup codes for account recovery */
    getBackupCodes(): any[];

    /** Check if SMS toggling is in progress */
    get togglingSMS(): boolean;

    /** Get nonces for MFA operations */
    getNonces(): MFAStore.Nonces;

    /** Check if user has seen backup code prompt */
    get hasSeenBackupPrompt(): boolean;
}
