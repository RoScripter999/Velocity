import { FluxStore } from "..";

export class BillingInfoStore extends FluxStore {
    get isBusy(): boolean;
    get isUpdatingPaymentSource(): boolean;
    get isRemovingPaymentSource(): boolean;
    get isSyncing(): boolean;
    get isSubscriptionFetching(): boolean;
    get isPaymentSourceFetching(): boolean;
    get editSourceError(): Error | null;
    get removeSourceError(): Error | null;
    get ipCountryCodeLoaded(): boolean;
    get ipCountryCode(): string | undefined;
    get ipLocationLoaded(): boolean;
    get ipLocation(): Record<string, any> | undefined;
    get ipLocationHasError(): boolean;
    get ipCountryCodeWithFallback(): string;
    get ipCountryCodeHasError(): boolean;
}
