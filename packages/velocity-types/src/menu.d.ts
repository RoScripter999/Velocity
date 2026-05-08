import type { ComponentType, CSSProperties, ForwardRefRenderFunction, MouseEvent, PropsWithChildren, ReactNode, UIEvent } from "react";

type RC<C> = ComponentType<PropsWithChildren<C & Record<string, any>>>;

export interface Menu {
    Menu: RC<{
        navId: string;
        onClose(): void;
        onSelect?(): void;
        onInteraction?(): void;
        className?: string;
        style?: CSSProperties;
        hideScroller?: boolean;
        "aria-label"?: string;
        variant?: "fixed" | "flexible";
    }>;
    MenuSeparator: ComponentType;
    MenuGroup: RC<{
        label?: string;
    }>;
    MenuItem: RC<{
        id: string;
        label: ReactNode;
        action?(e: MouseEvent): void;
        leadingAccessory?: {
            type: "icon";
            icon: ComponentType<any>;
        };
        trailingIndicator?: {
            type: "icon";
            icon: ComponentType<any>;
        };
        shortcut?: string;
        badge?: "new" | "beta" | string;
        loading?: boolean;
        subtext?: ReactNode;
        subtextLineClamp?: number;
        color?: "default" | "brand" | "danger" | "premium" | "premium-gradient" | "success";
        render?: ComponentType<any>;
        onChildrenScroll?: (e: UIEvent) => void;
        childRowHeight?: number;
        listClassName?: string;
        subMenuClassName?: string;
        disabled?: boolean;
        isFocused?: boolean;
        onClose?(): void;
        onFocus?(): void;
        className?: string;
        focusedClassName?: string;
        hasSubmenu?: boolean;
        keepItemStyles?: boolean;
        dontCloseOnAction?: boolean;
        dontCloseOnActionIfHoldingShiftKey?: boolean;
        subMenuIconClassName?: string;
        menuItemProps?: Record<string, any>;
        iconProps?: Record<string, any>;
    }>;
    MenuCheckboxItem: RC<{
        id: string;
        label: string;
        checked: boolean;
        action?(e: MouseEvent): void;
        disabled?: boolean;
        isFocused?: boolean;
        color?: string;
        subtext?: ReactNode;
        menuItemProps?: Record<string, any>;
        className?: string;
        focusedClassName?: string;
    }>;
    MenuRadioItem: RC<{
        id: string;
        group: string;
        label: string;
        checked: boolean;
        action?(e: MouseEvent): void;
        disabled?: boolean;
        isFocused?: boolean;
        color?: string;
        showDefaultFocus?: boolean;
        menuItemProps?: Record<string, any>;
    }>;
    MenuSwitchItem: RC<{
        id: string;
        label: string;
        checked: boolean;
        action?(e: MouseEvent): void;
        disabled?: boolean;
        isFocused?: boolean;
        color?: string;
        menuItemProps?: Record<string, any>;
    }>;
    MenuControlItem: RC<{
        id: string;
        label?: ReactNode;
        control?: ForwardRefRenderFunction<any, any>;
        interactive?: boolean;
        disabled?: boolean;
        isFocused?: boolean;
        color?: string;
        menuItemProps?: Record<string, any>;
        onClose?(): void;
    }>;
    MenuSliderControl: RC<{
        minValue: number;
        maxValue: number;
        value: number;
        onChange(value: number): void;
        renderValue?(value: number): string;
        disabled?: boolean;
        "aria-label"?: string;
    }>;
    MenuSearchControl: RC<{
        query: string;
        onChange(query: string): void;
        placeholder?: string;
        disabled?: boolean;
        "aria-label"?: string;
    }>;
    MenuRadioGroup: RC<{
        label?: string;
    }>;
    MenuCustomItem: RC<{
        color?: string;
        disabled?: boolean;
        isFocused?: boolean;
        keepItemStyles?: boolean;
        menuItemProps?: Record<string, any>;
        action?(e: MouseEvent): void;
        dontCloseOnAction?: boolean;
        dontCloseOnActionIfHoldingShiftKey?: boolean;
        onClose?(): void;
    }>;
}

export interface ContextMenuApi {
    closeContextMenu(): void;
    openContextMenu(
        event: UIEvent,
        render?: Menu["Menu"],
        options?: { enableSpellCheck?: boolean; },
        renderLazy?: () => Promise<Menu["Menu"]>
    ): void;
    openContextMenuLazy(
        event: UIEvent,
        renderLazy?: () => Promise<Menu["Menu"]>,
        options?: { enableSpellCheck?: boolean; }
    ): void;
}
