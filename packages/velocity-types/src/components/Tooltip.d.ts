import { ComponentType, CSSProperties, HTMLElementType, FunctionComponent, PropsWithChildren, ReactNode, RefObject } from "react";
import { PopoutAlign, PopoutPosition } from "../";

declare enum TooltipColor {
    PRIMARY = "primary",
    GREY = "grey",
    BRAND = "brand",
    GREEN = "green",
    RED = "red"
}

export interface TooltipProps {
    text: ReactNode | (() => ReactNode);
    children: FunctionComponent<{
        onClick(): void;
        onMouseEnter(): void;
        onMouseLeave(): void;
        onContextMenu(): void;
        onFocus(): void;
        onBlur(): void;
        "aria-label"?: string;
    }>;
    "aria-label"?: string;

    targetElementRef?: RefObject<any>;
    /** @default "center" */
    align?: PopoutAlign;
    /** @default "top" */
    position?: PopoutPosition;
    /** Tooltip.Colors */
    color?: `${TooltipColor}`;
    /** @default 8 */
    spacing?: number;

    allowOverflow?: boolean;
    /** Only shows the tooltip if the target's content overflows @default false */
    overflowOnly?: boolean;
    forceOpen?: boolean;
    /** @default true */
    hideOnClick?: boolean;
    /** @default true */
    shouldShow?: boolean;
    /** Delay in ms before showing the tooltip on hover */
    delay?: number;
    clickableOnMobile?: boolean;

    tooltipClassName?: string;
    tooltipContentClassName?: string;
    tooltipPointerClassName?: string;
    tooltipStyle?: CSSProperties;
    disableTooltipPointerEvents?: boolean;
    dataMeticulousIgnore?: boolean;
    /** Overrides the string used to derive the tooltip's position key */
    positionKeyStemOverride?: string;

    onAnimationRest?(): void;
    onTooltipShow?(): void;
    onTooltipHide?(): void;
}

export interface RichTooltipProps extends PropsWithChildren {
    title?: ReactNode;
    body: ReactNode;
    /** Asset (icon/image) to display on the left side, For some reason it doesn't accept ComponentType */
    asset?: ReactNode;
    /** Size of the asset in pixels. @default 48 */
    assetSize?: number;
    /** Padding style of the tooltip. @default "default" */
    padding?: "default" | "lg";
    /** Whether children is rendered as a container element instead of cloned. @default false */
    asContainer?: boolean;
    /** HTML element tag for the container when {@link asContainer} is true. @default "span" */
    element?: HTMLElementType;
    /** Position of the tooltip. @default "top" */
    position?: PopoutPosition;
    /** Alignment of the tooltip. @default "center" */
    align?: PopoutAlign;
    spacing?: number;

    /**
     * Configuration for the caret (arrow pointer) that appears on the tooltip
     * pointing toward the target element. By default the caret is centered
     * and its side is derived from {@link RichTooltipProps.position position}.
     */
    caretConfig?: {
        /**
         * Alignment of the caret along the tooltip edge.
         * Falls back to "custom" if a nudge offset is applied, otherwise "center".
         */
        align?: "custom" | "center";
        /**
         * Pixel offset of the caret from its default position.
         * Only applied when {@link align} is `"custom"`.
         */
        customOffset?: number;
        /**
         * Overrides the side of the tooltip the caret appears on.
         * Normally derived automatically from {@link RichTooltipProps.position position}.
         */
        position?: PopoutPosition;
    };

    /** Ref to the target element */
    targetElementRef?: RefObject<any>;
    /** External anchor ref (overrides internal target ref) */
    anchorRef?: RefObject<any>;
    positionKey?: string;
    ariaHidden?: boolean;
    lineClamp?: number;

    shouldShow?: boolean;
    delay?: number;
    onTooltipShow?(): void;
    onTooltipHide?(): void;
    forceOpen?: boolean;
    overflowOnly?: boolean;
    hideOnClick?: boolean;
}

export type RichTooltip = ComponentType<RichTooltipProps>;

export type Tooltip = ComponentType<TooltipProps> & {
    Colors: typeof TooltipColor;
};
