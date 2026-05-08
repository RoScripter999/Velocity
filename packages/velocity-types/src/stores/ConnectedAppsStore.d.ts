import { FluxStore } from "..";

export namespace ConnectedAppsStore {
    export interface ConnectedApp {
        count: number;
        id: string;
        name: string;
        icon?: string;
        coverImage?: string;
        authenticated: boolean;
    }
}

export class ConnectedAppsStore extends FluxStore {
    /** Check if an application is connected */
    isConnected(applicationId: string): boolean;

    /** Get all connected applications */
    get connections(): ConnectedAppsStore.ConnectedApp[];

    /** Get a specific connected application */
    getApplication(applicationId: string): ConnectedAppsStore.ConnectedApp | undefined;

    /** Get all connections as object */
    getAllConnections(): Record<string, ConnectedAppsStore.ConnectedApp>;
}
