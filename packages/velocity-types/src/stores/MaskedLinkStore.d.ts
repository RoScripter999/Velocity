import { FluxStore } from "..";

export class MaskedLinkStore extends FluxStore {
    /** Check if a domain is trusted (safe to open without masking) */
    isTrustedDomain(url: string): boolean;

    /** Check if a protocol is trusted */
    isTrustedProtocol(url: string): boolean;
}
