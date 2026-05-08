import { FluxStore } from "..";

export namespace DevToolsSettingsStore {
    export interface State {
        sidebarWidth: number;
        lastOpenTabId: string | null;
        displayTools: boolean;
        showDevWidget: boolean;
        devWidgetPosition: {
            x: number;
            y: number;
        };
        sortedScreenKeys: string[];
    }
}

export class DevToolsSettingsStore extends FluxStore {
    getUserAgnosticState(): DevToolsSettingsStore.State;
    get sidebarWidth(): number;
    get lastOpenTabId(): string | null;
    get displayTools(): boolean;
    get showDevWidget(): boolean;
    get devWidgetPosition(): { x: number; y: number; };
    get sortedScreenKeys(): string[];
}
