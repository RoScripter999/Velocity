import { FluxStore } from "..";

export namespace EntitlementStore {
    export interface Entitlement {
        id: string;
        skuId: string;
        applicationId: string;
        type: number;
        sourceType: number;
        consumed?: boolean;
        startsAt?: Date;
        endsAt?: Date;
        subscriptionId?: string;
        isValid(userId: string, guildStore: any, branchId?: string | null): boolean;
    }
}

export class EntitlementStore extends FluxStore {
    get(entitlementId: string): EntitlementStore.Entitlement | undefined;
    getGiftable(): EntitlementStore.Entitlement[];
    getForApplication(applicationId: string): Set<EntitlementStore.Entitlement> | null;
    getForSku(skuId: string): Set<EntitlementStore.Entitlement> | null;
    get fetchingAllEntitlements(): boolean;
    get fetchedAllEntitlements(): boolean;
    get fetchedEndedEntitlements(): boolean;
    get applicationIdsFetching(): Set<string>;
    get applicationIdsFetched(): Set<string>;
    isFetchingForApplication(applicationId?: string): boolean;
    isFetchedForApplication(applicationId?: string): boolean;
    getForSubscription(subscriptionId: string): Set<EntitlementStore.Entitlement> | null;
    isEntitledToSku(userId: string, skuId: string, applicationId: string, branchId?: string | null): boolean;
    hasFetchedForApplicationIds(applicationIds: string[]): boolean;
    getReverseTrialEntitlement(includeEnded?: boolean): EntitlementStore.Entitlement | null;
    getFractionalPremium(options?: { includeEnded?: boolean; excludeReverseTrial?: boolean; }): EntitlementStore.Entitlement[];
    isFractionalPremiumActive(options?: { excludeReverseTrial?: boolean; }): boolean;
    getUnactivatedFractionalPremiumUnits(): EntitlementStore.Entitlement[];
}
