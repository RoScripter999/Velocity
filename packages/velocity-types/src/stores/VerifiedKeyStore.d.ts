import { FluxStore } from "..";

export namespace VerifiedKeyStore {
    export interface State {
        users: Record<string, Record<string, number>>;
    }
}

export class VerifiedKeyStore extends FluxStore {
    getState(): VerifiedKeyStore.State;
    getKeyTrustedAt(userId: string, key: Uint8Array): number | undefined;
    isKeyVerified(userId: string, key: Uint8Array): boolean;
    getUserIds(): string[];
    getUserVerifiedKeys(userId: string): Record<string, number> | undefined;
}
