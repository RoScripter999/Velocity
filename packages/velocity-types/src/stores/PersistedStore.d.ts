import { FluxDispatcher, FluxStore } from "..";
import { ActionHandlers } from "./FluxStore";

export class PersistedStore extends FluxStore {
    static displayName: string;
    static persistKey: string;
    static disableWrite: boolean;
    static throttleDelay: number;
    static migrations?: Array<(state: any) => any>;
    static allPersistKeys: Set<string>;
    static userAgnosticPersistKeys: Set<string>;
    static disableWrites: boolean;

    _version: number;
    _isInitialized: boolean;

    constructor(dispatcher: FluxDispatcher, actionHandlers?: ActionHandlers);

    initialize(state: any): void;
    initializeFromState(state: any): void;
    getState(): any;
    persist(): void;
    clear(): void;
    asyncPersist(): Promise<boolean>;

    static clearAll(options: { type: "all" | "user-data-only"; omit?: string[]; }): Promise<void>;
    static getAllStates(): Promise<Record<string, any>>;
    static initializeAll(states: Record<string, any>): void;
    static destroy(): void;

    [key: string]: any;
}

export type PersistedStoreClass = typeof PersistedStore;
