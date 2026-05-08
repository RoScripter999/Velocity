import { Activity, FluxStore } from "..";

export class FirstPartyRichPresenceStore extends FluxStore {
    /** Get all first party rich presence activities */
    getActivities(): Activity[];
}
