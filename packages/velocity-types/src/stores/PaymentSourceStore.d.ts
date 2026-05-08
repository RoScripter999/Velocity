import { FluxStore } from "..";

export namespace PaymentSourceStore {
    export interface PaymentSource {
        id: string;
        default: boolean;
        isDefault?: boolean;
        paymentMethodCountry?: string;
        [key: string]: any;
    }
}

export class PaymentSourceStore extends FluxStore {
    /** Get all payment sources */
    get paymentSources(): Record<string, PaymentSourceStore.PaymentSource>;

    /** Get all payment source IDs */
    get paymentSourceIds(): string[];

    /** Get default payment source ID */
    get defaultPaymentSourceId(): string | null;

    /** Get default payment source */
    get defaultPaymentSource(): PaymentSourceStore.PaymentSource | null;

    /** Check if payment sources have been fetched */
    get hasFetchedPaymentSources(): boolean;

    /** Get default billing country code */
    getDefaultBillingCountryCode(): string | null;

    /** Get a specific payment source */
    getPaymentSource(id: string): PaymentSourceStore.PaymentSource | undefined;
}
