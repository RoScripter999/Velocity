import { FluxStore } from "..";

export class GamePartyStore extends FluxStore {
    /** Get all users in a party */
    getParty(partyId: string): Set<string> | null;

    /** Get all user parties mapped by user ID */
    getUserParties(): Record<string, Record<string, string | null>>;

    /** Get all parties mapped by party ID */
    getParties(): Map<string, Set<string>>;
}
