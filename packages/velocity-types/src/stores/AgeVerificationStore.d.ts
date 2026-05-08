import { FluxStore } from "..";

export interface AgeVerificationMethod {
    [key: string]: any;
}

export class AgeVerificationStore extends FluxStore {
    get loading(): boolean;
    get methods(): AgeVerificationMethod[] | null;
}
