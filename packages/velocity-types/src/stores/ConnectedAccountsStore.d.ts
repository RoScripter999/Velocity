import { FluxStore } from "..";

export namespace ConnectedAccountsStore {
    export interface ConnectedAccount {
        id: string;
        type: string;
        name?: string;
        revoked?: boolean;
        accessToken?: string;
        integrations?: Integration[];
    }

    interface Integration {
        id: string;
        type: string;
        guild?: any;
        [key: string]: any;
    }
}

export class ConnectedAccountsStore extends FluxStore {
    isJoining(integrationId: string): boolean;
    joinErrorMessage(integrationId: string): string | undefined;
    isFetching(): boolean;
    getAccounts(): ConnectedAccountsStore.ConnectedAccount[];
    getLocalAccounts(): ConnectedAccountsStore.ConnectedAccount[];
    getAccount(accountId: string | null | undefined, type: string): ConnectedAccountsStore.ConnectedAccount | undefined;
    getLocalAccount(type: string): ConnectedAccountsStore.ConnectedAccount | undefined;
    isSuggestedAccountType(type: string): boolean;
    addPendingAuthorizedState(state: string): void;
    deletePendingAuthorizedState(state: string): void;
    hasPendingAuthorizedState(state: string): boolean;
}
