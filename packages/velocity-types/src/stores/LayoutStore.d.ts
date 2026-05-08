import { FluxStore } from "..";

export namespace LayoutStore {
    export interface Anchor {
        left?: number;
        top?: number;
        bottom?: number;
        right?: number;
    }

    export interface Size {
        width?: number | string;
        height?: number | string;
        fixed?: boolean;
    }

    export interface MinSize {
        width: number;
        height: number;
    }

    export interface WidgetConfig {
        resizeX: boolean;
        resizeY: boolean;
        dragAnywhere: boolean;
        layoutPolicy: string;
        defaultSettings: {
            anchor: Anchor;
            size: Size;
            pinned: boolean;
            minSize: MinSize;
        };
        version: string;
    }

    export interface Widget {
        id: string;
        type: string;
        layoutId: string;
        anchor: Anchor;
        size: Size;
        opacity?: number;
        minSize: MinSize;
        pinned: boolean;
        zIndex: number;
        meta?: Record<string, any>;
        showExtrasHintTimestamp?: number;
        merge(updates: Partial<Widget>): Widget;
        set<K extends keyof Widget>(key: K, value: Widget[K]): Widget;
    }

    export interface Layout {
        id: string;
        widgets: string[];
        version: string;
        set(key: string, value: any): Layout;
    }
}

export class LayoutStore extends FluxStore {
    /** Get all layouts */
    getLayouts(): Record<string, LayoutStore.Layout>;

    /** Get a specific layout by ID */
    getLayout(layoutId: string): LayoutStore.Layout | undefined;

    /** Get all widgets */
    getAllWidgets(): Record<string, LayoutStore.Widget>;

    /** Get a specific widget by ID */
    getWidget(widgetId: string): LayoutStore.Widget | undefined;

    /** Get all widgets in a layout */
    getWidgetsForLayout(layoutId: string): LayoutStore.Widget[];

    /** Get unpinned widgets for a layout */
    getAllUnpinnedPinnedWidgets(layoutId: string): string[];

    /** Get widget configuration for a type */
    getWidgetConfig(widgetType: string): LayoutStore.WidgetConfig | undefined;

    /** Get default settings for a widget type */
    getWidgetDefaultSettings(widgetType: string): any;

    /** Get the type of a widget by ID */
    getWidgetType(widgetId: string): string;

    /** Get all widgets of a specific type */
    getWidgetsByType(widgetType: string): LayoutStore.Widget[];

    /** Get widgets of a type in a specific layout */
    getWidgetsByTypeAndLayout(widgetType: string, layoutId: string): LayoutStore.Widget[];

    /** Get all registered widget configurations */
    getRegisteredWidgets(): Record<string, LayoutStore.WidgetConfig>;

    /** Get a default layout for a layout ID */
    getDefaultLayout(layoutId: string, version?: number): LayoutStore.Widget[];

    /** Get current state */
    getState(): {
        layouts: Record<string, LayoutStore.Layout>;
        widgets: Record<string, LayoutStore.Widget>;
    };
}
