import { FluxStore, User } from "..";

export class BrowserHandoffStore extends FluxStore {
    /* I have no idea what this does */
    isHandoffAvailable(): boolean;
    /* I have no idea what this does? prop user? */
    get user(): User | undefined;
    /* I have no idea what this does */
    get key(): string | null;
}
