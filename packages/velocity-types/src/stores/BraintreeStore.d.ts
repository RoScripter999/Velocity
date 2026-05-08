import { FluxStore } from "..";

export namespace BraintreeStore {
    export enum PaymentSourceType {
        UNKNOWN = 0,
        CARD = 1,
        PAYPAL = 2,
        GIROPAY = 3,
        SOFORT = 4,
        PRZELEWY24 = 5,
        SEPA_DEBIT = 6,
        PAYSAFE_CARD = 7,
        GCASH = 8,
        GRABPAY_MY = 9,
        MOMO_WALLET = 10,
        VENMO = 11,
        GOPAY_WALLET = 12,
        KAKAOPAY = 13,
        BANCONTACT = 14,
        EPS = 15,
        IDEAL = 16,
        CASH_APP = 17,
        APPLE = 18,
        PAYMENT_REQUEST = 99
    }

    export enum PaymentProvider {
        STRIPE = 1,
        BRAINTREE = 2,
        APPLE = 3,
        GOOGLE = 4,
        ADYEN = 5,
        APPLE_PARTNER = 6,
        VIRTUAL_CURRENCY = 8,
        APPLE_ADVANCED_COMMERCE = 9
    }
}

export class BraintreeStore extends FluxStore {
    getClient(): Record<string, any> | null;
    getPayPalClient(): Record<string, any> | null;
    getVenmoClient(): Record<string, any> | null;
    getLastURL(): string | null;
}
