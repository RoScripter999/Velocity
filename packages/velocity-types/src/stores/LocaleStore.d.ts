import { FluxStore } from "..";

export class LocaleStore extends FluxStore {
    /** Get current locale */
    get locale(): string;

    /** Get system locale */
    get systemLocale(): string;
}
