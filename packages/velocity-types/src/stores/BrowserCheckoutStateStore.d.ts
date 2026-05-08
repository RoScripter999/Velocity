import { FluxStore } from "..";

export enum BrowserCheckoutState {
    UNKNOWN = 0,
    PENDING = 1,
    DONE = 2,
}

export class BrowserCheckoutStateStore extends FluxStore {
    get browserCheckoutState(): BrowserCheckoutState;
    get loadId(): string | null;
    get skuId(): string | null;
    get planId(): string | null;
}
