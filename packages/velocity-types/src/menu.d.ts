import type { CSSColorToken, FieldProps, IconProps, PopoutAlign, PopoutPosition, RawCSSColor, Status, Theme } from "@velocity-types";
import type { ComponentType, CSSProperties, ForwardRefRenderFunction, MouseEvent, PropsWithChildren, ReactNode, UIEvent } from "react";

type RC<C> = ComponentType<PropsWithChildren<C>>;

type MenuColor = "default" | "brand" | "danger" | "premium" | "premium-gradient" | "success";

type LeadingAccessory =
    | { type: "icon"; icon: ComponentType<any>; color?: CSSColorToken; className?: string; }
    | { type: "image"; src: string; }
    | { type: "emoji"; emojiId?: string; src?: string; animated?: boolean; }
    | { type: "avatar"; src: string; }
    | { type: "roleDot"; variant?: "dot" | "circle"; color?: RawCSSColor; colors?: { primaryColor?: RawCSSColor; secondaryColor?: RawCSSColor; tertiaryColor?: RawCSSColor; }; }
    | { type: "status"; status: Status; }
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
    MenuSeparator: ComponentType<any>;
    MenuGroup: RC<{
        label?: string;
        className?: string;
    }>;
    MenuItem: RC<{
        id: string;
        label?: ReactNode;
        void_label?: (props: any) => ReactNode;
        action?(e: MouseEvent): void;
        icon?: ComponentType<any>;
        /** Icon on the left that is always visible regardless of the mana context experiment */
        iconLeft?: ComponentType<any>;
        /* Only renders when mana contextmenus experiement is enabled. */
        leadingAccessory?: LeadingAccessory;
        trailingIndicator?: Extract<LeadingAccessory, { type: "icon"; }>;
        shortcut?: string;
        badge?: FieldProps["badge"];
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
        iconProps?: IconProps;
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
        /** Icon on the left that is always visible regardless of the mana context experiment */
        leftIcon?: ComponentType<any>;
        leadingAccessory?: LeadingAccessory;
        className?: string;
        focusedClassName?: string;
    }>;
    MenuRadioItem: RC<{
        id: string;
        group: string;
        label?: ReactNode;
        void_label?: (props: any) => ReactNode;
        checked: boolean;
        action?(e: MouseEvent): void;
        disabled?: boolean;
        color?: MenuColor;
        subtext?: ReactNode;
        subtextLineClamp?: number;
        /** Icon on the left that is always visible regardless of the mana context experiment */
        leftIcon?: ComponentType<any>;
        leadingAccessory?: LeadingAccessory;
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
    MenuTextInputItem: RC<{
        id: string;
        label?: ReactNode;
        value: string;
        onChange(value: string): void;
        placeholder?: string;
        maxLength?: number;
        disabled?: boolean;
        color?: MenuColor;
        "aria-label"?: string;
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
}

export interface ContextMenuOptions {
    /** Target alignment relative to placement */
    align?: PopoutAlign;
    /** Target placement position */
    position?: PopoutPosition;
    /** Analytics impression name */
    impressionName?: string;
    /** Analytics impression properties */
    impressionProperties?: Record<string, string | number | boolean>;
    /** Whether to disable the click trap overlay */
    disableClickTrap?: boolean;
    /** Automatically update position on content size changes */
    repositionOnContentChange?: boolean;
    /** Enable desktop spell checking for input context menus */
    enableSpellCheck?: boolean;
    /** Callback triggered when the context menu unmounts/closes */
    onClose?(): void;
}

export interface ContextMenuProps {
    position?: string;
    /** Current app theme */
    theme: Theme;
    /** Triggers a layout update when context menu dimensions change */
    onHeightUpdate?(): void;
    /** Configuration options passed to the context menu */
    config?: ContextMenuOptions;
    /** Target element that triggered the context menu */
    target?: Element;
    /** Layer Context where the menu was opened from */
    context: "APP" | "LAYER" | "POPOUT" | "CALL_TILE_POPOUT";
}

export interface ContextMenuApi {
    closeContextMenu(): void;
    openContextMenu(
        event: UIEvent,
        render?: ComponentType<ContextMenuProps> | ((props: ContextMenuProps) => ReactNode),
        options?: ContextMenuOptions,
        renderLazy?: () => Promise<ComponentType<ContextMenuProps> | ((props: ContextMenuProps) => ReactNode)>
    ): void;
    openContextMenuLazy(
        event: UIEvent,
        renderLazy?: () => Promise<ComponentType<ContextMenuProps> | ((props: ContextMenuProps) => ReactNode)>,
        options?: ContextMenuOptions
    ): void;
}
