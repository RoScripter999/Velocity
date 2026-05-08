import { FluxStore } from "..";

export namespace PromotionsStore {
    export interface Promotion {
        id: string;
        startDate: Date;
        endDate: Date;
        outboundTitle?: string;
        promotion_type: number;
        marketing_components?: any[];
    }

    export interface BogoPromotion {
        id: string;
        startDate: string;
        endDate: string;
    }

    export interface MarketingComponent {
        component_type: string;
        [key: string]: any;
    }

    export interface State {
        hasFetchedConsumedInboundPromotionId: boolean;
        consumedInboundPromotionId: string | null;
        lastSeenOutboundPromotionStartDate: string | null;
    }
}

export class PromotionsStore extends FluxStore {
    get outboundPromotions(): PromotionsStore.Promotion[];
    get outboundRecurringPromotions(): PromotionsStore.Promotion[];
    get lastSeenOutboundPromotionStartDate(): string | null;
    get lastDismissedOutboundPromotionStartDate(): string | null;
    get lastFetchedActivePromotions(): number | null;
    get isFetchingActivePromotions(): boolean;
    get hasFetchedConsumedInboundPromotionId(): boolean;
    get consumedInboundPromotionId(): string | null;
    get bogoPromotion(): PromotionsStore.BogoPromotion | null;
    get isFetchingActiveBogoPromotion(): boolean;
    get lastFetchedActiveBogoPromotion(): number | null;
    get promotionsByType(): Record<number, Record<string, PromotionsStore.Promotion>>;
    getState(): PromotionsStore.State;
    getMarketingComponentByType(componentType: string): PromotionsStore.MarketingComponent | null;
}
