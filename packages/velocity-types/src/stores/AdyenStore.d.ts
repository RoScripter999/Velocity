import { FluxStore } from "..";

export interface AdyenClient {
    [key: string]: any;
}

export interface CashAppPayComponent {
    [key: string]: any;
}

export class AdyenStore extends FluxStore {
    get client(): AdyenClient | null;
    get cashAppPayComponent(): CashAppPayComponent | null;
}
