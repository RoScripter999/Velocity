import { ComponentType, ReactNode } from "react";

export interface TabItem<T = PropertyKey> {
    id: T;
    label: ReactNode;
    icon?: ComponentType<any>;
    disabled?: boolean;
    "aria-label"?: string;
    /** Content rendered inside the tab's panel. */
    panel: () => ReactNode;
}

export interface TabsProps<T = PropertyKey> {
    items: TabItem<T>[];
    selectedId: T;
    onChange?: (id: T) => void;
    /** @default false */
    fullWidth?: boolean;
    /** Disables all the items @default false */
    disabled?: boolean;
    /** Arrow navigation @default manual */
    keyboardActivation?: "manual" | "automatic";
    /** @default none */
    panelAnimation?: "none" | "fade";
    "aria-label"?: string;
    "aria-labelledby"?: string;
}

export type Tabs = <T extends PropertyKey = PropertyKey>(props: TabsProps<T>) => ReactNode;
