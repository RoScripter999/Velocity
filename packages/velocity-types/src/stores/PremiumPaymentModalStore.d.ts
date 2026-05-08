import { FluxStore } from "..";

export namespace PremiumPaymentModalStore {
    export interface GiftCode {
        code: string;
        uses: number;
        sku_id: string;
    }
}

export class PremiumPaymentModalStore extends FluxStore {
    get paymentError(): any;
    getGiftCode(skuId: string): string | null;
}
