import { FluxStore } from "..";
import { TokenStatus } from "../../enums";

export namespace MultiAccountStore {
    export interface User {
        id: string;
        avatar: string | null;
        username: string;
        discriminator: string;
        tokenStatus: TokenStatus;
        pushSyncToken: string | null;
    }

    export interface MultiAccountState {
        users: User[];
        canUseMultiAccountMobile: boolean;
    }
}

export class MultiAccountStore extends FluxStore {
    getCanUseMultiAccountMobile(): boolean;
    getState(): MultiAccountStore.MultiAccountState;
    getUsers(): MultiAccountStore.User[];
    // Returns only users with valid tokens (not INVALID status)
    getValidUsers(): MultiAccountStore.User[];
    // Returns true if there are any logged in accounts
    getHasLoggedInAccounts(): boolean;
    // Returns true if any user tokens are currently being validated
    getIsValidatingUsers(): boolean;
    // Whether multi account notifications can be used based on mobile experiment
    get canUseMultiAccountNotifications(): boolean;
    // Returns true while account switching is in progress
    get isSwitchingAccount(): boolean;
}
