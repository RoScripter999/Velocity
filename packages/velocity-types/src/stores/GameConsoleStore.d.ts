import { FluxStore } from "..";

export namespace GameConsoleStore {
    export interface RemoteSession {
        type: string;
        nonce: string;
        channelId: string;
        startedAt: number;
        deviceId?: string;
        commandId?: string;
    }

    export interface Device {
        id: string;
        // holy god IM NOT DOING THIS
        [key: string]: any;
    }

    export interface State {
        lastSelectedDeviceByPlatform: Record<string, string>;
    }
}

export class GameConsoleStore extends FluxStore {
    /** Get user agnostic state */
    getUserAgnosticState(): GameConsoleStore.State;

    /** Get devices for a platform */
    getDevicesForPlatform(platform: string): Record<string, GameConsoleStore.Device>;

    /** Get last selected device for a platform */
    getLastSelectedDeviceByPlatform(platform: string): string | undefined;

    /** Get a specific device */
    getDevice(platform: string, deviceId: string): GameConsoleStore.Device | undefined;

    /** Check if fetching devices for a platform */
    getFetchingDevices(platform: string): boolean;

    /** Get pending device commands */
    getPendingDeviceCommands(): Set<string>;

    /** Get remote session ID */
    getRemoteSessionId(): string | null;

    /** Get awaiting remote session info */
    getAwaitingRemoteSessionInfo(): GameConsoleStore.RemoteSession | null;
}
