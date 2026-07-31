import type { ComponentType, CSSProperties, ForwardRefRenderFunction, MouseEvent, PropsWithChildren, ReactNode, UIEvent } from "react";

type RC<C> = ComponentType<PropsWithChildren<C & Record<string, any>>>;

type MenuColor = "default" | "brand" | "danger" | "premium" | "premium-gradient" | "success";

type MenuLeadingAccessory =
    | { type: "icon"; icon: ComponentType<any>; color?: string; className?: string; }
    | { type: "image"; src: string; }
    | { type: "emoji"; emojiId?: string; src?: string; animated?: boolean; }
    | { type: "avatar"; src: string; }
    | { type: "roleDot"; variant: "dot" | string; color?: any; colors?: any; }
    | { type: "status"; status: any; }
    | { type: "guildTag"; element: ReactNode; };

export interface Menu {
    Menu: RC<{
        navId: string;
        onClose?(): void;
        onSelect?(): void;
        onInteraction?(): void;
        className?: string;
        style?: CSSProperties;
        hideScroller?: boolean;
        "aria-label"?: string;
        /** @default flexible */
        variant?: "fixed" | "flexible";
    }>;
    MenuSeparator: ComponentType;
    MenuGroup: RC<{
        label?: string;
        className?: string;
        color?: MenuColor;
    }>;
    MenuItem: RC<{
        id: string;
        label?: ReactNode;
        void_label?: (props: any) => ReactNode;
        action?(e: MouseEvent): void;
        icon?: ComponentType<any>;
        iconLeft?: ComponentType<any>;
        /* Only renders when mana contextmenus experiement is enabled. */
        leadingAccessory?: MenuLeadingAccessory;
        trailingIndicator?: {
            type: "icon";
            icon: ComponentType<any>;
            color?: string;
            className?: string;
        };
        shortcut?: string;
        badge?: string | ({ type: string; } & Record<string, any>);
        loading?: boolean;
        subtext?: ReactNode;
        subtextLineClamp?: number;
        color?: MenuColor;
        /** Renders this item as a fully custom item instead of the default layout. */
        render?: (props: { color: MenuColor; disabled: boolean; isFocused: boolean; }) => ReactNode;
        onChildrenScroll?: (e: UIEvent) => void;
        childRowHeight?: number;
        listClassName?: string;
        subMenuClassName?: string;
        disabled?: boolean;
        onFocus?(): void;
        className?: string;
        focusedClassName?: string;
        navigable?: boolean;
        /** Only used when `render` is set. */
        keepItemStyles?: boolean;
        dontCloseOnAction?: boolean;
        dontCloseOnActionIfHoldingShiftKey?: boolean;
        iconProps?: Record<string, any>;
    }>;
    MenuCheckboxItem: RC<{
        id: string;
        label?: ReactNode;
        void_label?: (props: any) => ReactNode;
        checked: boolean;
        action?(e: MouseEvent): void;
        disabled?: boolean;
        color?: MenuColor;
        subtext?: ReactNode;
        subtextLineClamp?: number;
        leftIcon?: ComponentType<any>;
        leadingAccessory?: MenuLeadingAccessory;
        className?: string;
        focusedClassName?: string;
    }>;
    MenuRadioItem: RC<{
        id: string;
        // Not read anywhere in this render function, unconfirmed. Send the radio group module if it matters.
        group: string;
        label?: ReactNode;
        void_label?: (props: any) => ReactNode;
        checked: boolean;
        action?(e: MouseEvent): void;
        disabled?: boolean;
        color?: MenuColor;
        subtext?: ReactNode;
        subtextLineClamp?: number;
        leftIcon?: ComponentType<any>;
        leadingAccessory?: MenuLeadingAccessory;
    }>;
    MenuSwitchItem: RC<{
        id: string;
        label?: ReactNode;
        checked: boolean;
        action?(e: MouseEvent): void;
        disabled?: boolean;
        color?: MenuColor;
        subtext?: ReactNode;
        subtextLineClamp?: number;
        className?: string;
    }>;
    MenuControlItem: RC<{
        id: string;
        label?: ReactNode;
        control?: ForwardRefRenderFunction<any, any>;
        interactive?: boolean;
        disabled?: boolean;
        color?: MenuColor;
        showDefaultFocus?: boolean;
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
        label?: ReactNode;
        color?: MenuColor;
        value: string;
        onChange(value: string): void;
        placeholder?: string;
        maxLength?: number;
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
