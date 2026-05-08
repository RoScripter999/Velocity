import { FluxStore } from "..";

export namespace DetectedOffPlatformPremiumPerksStore {
    export interface DetectedPerk {
        skuId: string;
        applicationId: string;
    }
}

export class DetectedOffPlatformPremiumPerksStore extends FluxStore {
    /** Get all detected off-platform premium perks */
    getDetectedOffPlatformPremiumPerks(): DetectedOffPlatformPremiumPerksStore.DetectedPerk[];
}
