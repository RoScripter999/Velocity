import { FluxStore } from "..";

export namespace VirtualCurrencyStore {
    export interface Balance {
        amount: number;
        [key: string]: any;
    }

    export interface Entitlement {
        id: string;
        skuId: string;
        [key: string]: any;
    }
}

export class VirtualCurrencyStore extends FluxStore {
    get redeemError(): any;
    get isRedeeming(): boolean;
    get redeemingSkuId(): string | null;
    get entitlements(): VirtualCurrencyStore.Entitlement[] | null;
    get balance(): VirtualCurrencyStore.Balance | null;
    get fetchBalanceError(): any;
    get isFetchingBalance(): boolean;
    get onboardingModalOpenedPrior(): boolean;
    get balancePillOverlay(): boolean;
    setBalancePillOverlay(overlay: boolean): void;
    getCurrentBalance(): VirtualCurrencyStore.Balance | null;
    handleBalanceStateReset(): void;
}
