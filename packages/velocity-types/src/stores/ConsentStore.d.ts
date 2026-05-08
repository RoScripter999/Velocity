import { FluxStore } from "..";

export namespace ConsentStore {
    export interface Consent {
        consented: boolean;
        [key: string]: any;
    }
}

export class ConsentStore extends FluxStore {
    /** Check if user has consented to something */
    hasConsented(consentType: string): boolean;

    /** Get all consents */
    get consents(): Record<string, ConsentStore.Consent>;

    /** Check if consents have been fetched */
    get fetchedConsents(): boolean;

    /** Check if consents were received in connection open */
    get receivedConsentsInConnectionOpen(): boolean;

    /** Get authentication consent required status */
    getAuthenticationConsentRequired(): boolean | null;
}
