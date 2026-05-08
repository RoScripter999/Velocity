import { FluxStore } from "..";

export namespace GiftCodeStore {
    export interface GiftCode {
        code: string;
        expiresAt?: Date;
        uses: number;
        maxUses: number;
        userId: string;
        skuId: string;
        subscriptionPlanId?: string;
        redeemed: boolean;
        revoked: boolean;
        isExpired(): boolean;
        merge(updates: Partial<GiftCode>): GiftCode;
        set(key: string, value: any): GiftCode;
    }

    export interface GiftCodeError {
        code: string;
        message: string;
    }
}

export class GiftCodeStore extends FluxStore {
    /** Get a gift code by code string */
    get(code: string): GiftCodeStore.GiftCode | null;

    /** Get error for a gift code */
    getError(code: string): GiftCodeStore.GiftCodeError | undefined;

    /** Get all gift codes for a gifter, SKU, and plan */
    getForGifterSKUAndPlan(userId: string, skuId: string, subscriptionPlanId?: string): GiftCodeStore.GiftCode[];

    /** Check if a code is being resolved */
    getIsResolving(code: string): boolean;

    /** Check if a code has been resolved */
    getIsResolved(code: string): boolean;

    /** Check if a code is being accepted/redeemed */
    getIsAccepting(code: string): boolean;

    /** Check if gift codes are being fetched for a SKU and plan */
    getUserGiftCodesFetchingForSKUAndPlan(skuId: string, subscriptionPlanId: string): boolean;

    /** Get timestamp when gift codes were last loaded for a SKU and plan */
    getUserGiftCodesLoadedAtForSKUAndPlan(skuId: string, subscriptionPlanId: string): number | undefined;

    /** Get all codes currently being resolved */
    getResolvingCodes(): string[];

    /** Get all codes that have been resolved */
    getResolvedCodes(): string[];

    /** Get all codes currently being accepted */
    getAcceptingCodes(): string[];
}
