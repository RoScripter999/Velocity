import { FluxStore } from "..";

export namespace PhoneStore {
    export interface State {
        selectedCountryCode: string | null;
    }
}

export class PhoneStore extends FluxStore {
    getUserAgnosticState(): PhoneStore.State;
    getCountryCode(): string;
}
