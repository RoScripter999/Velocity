import { FluxStore } from "..";

export class ApplicationStoreLocationStore extends FluxStore {
    getCurrentPath(): string | null;
    getCurrentRoute(): string | null;
}
