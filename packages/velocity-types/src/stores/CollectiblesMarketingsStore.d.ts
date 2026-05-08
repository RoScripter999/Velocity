import { FluxStore } from "..";

export class CollectiblesMarketingsStore extends FluxStore {
    /** Get marketing for a surface */
    getMarketingBySurface(surface: string): any;

    /** Get fetch state */
    get fetchState(): string;
}
