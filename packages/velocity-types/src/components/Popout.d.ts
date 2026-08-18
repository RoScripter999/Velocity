
import { ComponentType, Context, KeyboardEvent, MouseEvent, ReactNode, RefObject } from "react";
import { LoadingIndicator } from "../components";

declare enum PopoutAnimation {
    NONE = "1",
    TRANSLATE = "2",
    SCALE = "3",
    FADE = "4"
}

export type PopoutPosition = "top" | "bottom" | "left" | "right" | "center" | "window_center";
export type PopoutAlign = "top" | "bottom" | "left" | "right" | "center";
export type PopoutScrollBehavior = "close" | "sticky";

export interface PopoutRenderProps {
    position: PopoutPosition;
    nudge: number;
    isPositioned: boolean;
    updatePosition(): void;
    closePopout(reason?: string): void;
    setPopoutRef(ref: HTMLElement | null): void;
}

export interface PopoutProps {
    children(
        thing: {
            "aria-controls"?: string;
            "aria-expanded": boolean;
            onClick(event: MouseEvent<HTMLElement>): void;
            onKeyDown(event: KeyboardEvent<HTMLElement>): void;
            onMouseDown(event: MouseEvent<HTMLElement>): void;
            onMouseEnter(): void;
        },
        data: {
            isShown: boolean;
            position?: PopoutPosition;
        }
    ): ReactNode;
    shouldShow?: boolean;
    targetElementRef: RefObject<Element | null>;
    renderPopout(props: PopoutRenderProps): ReactNode;
    preload?(): Promise<any>;
    /** Shown while preload is running */
    loadingComponent?: LoadingIndicator;

    onRequestOpen?(): void;
    onRequestClose?(event: any, reason: string): symbol | void;
    /** Only fires on shift click, prevents the normal open/close toggle when set */
    onShiftClick?(event: MouseEvent<HTMLElement>): void;

    /** Which side of the target the popout aligns against, relative to position */
    align?: PopoutAlign;
    /** Popout.Animation */
    animation?: PopoutAnimation;
    /** Only used when animation is TRANSLATE, SCALE, or FADE, swaps in the position the popout animates from */
    animationPosition?: PopoutPosition;
    /** Flips to the opposite side if there isn't enough room @default false */
    autoInvert?: boolean;
    avoidancePadding?: number;
    /**
     * Closes the popout if a modal opens on top of it while shown @default true
     * DisableClickTraps plugin disables this completely
     */
    clickTrap?: boolean;
    /** Keeps the popout locked to position, disables auto placement stuff. */
    fixed?: boolean;
    /** Prevents pointer events from reaching the popout content */
    disablePointerEvents?: boolean;
    /** Skips closing the popout for clicks that open a modal @default false */
    ignoreModalClicks?: boolean;
    /** Which layer root the popout portals into the app layer context */
    layerContext?: Context<any>;
    /** Nudges the popout back into the viewport if it would overflow @default false */
    nudgeAlignIntoViewport?: boolean;
    offset?: number;
    /** Position of the popout when it renders @default "right" */
    position?: PopoutPosition;
    positionKey?: string;
    popoutKey?: string;
    /** Closes the popout when the target scrolls out of view, or repositions it if sticky */
    scrollBehavior?: PopoutScrollBehavior;
    /** @default 0 */
    spacing?: number;
    useMouseEnter?: boolean;
    useRawTargetDimensions?: boolean;
    /** @default true */
    closeOnClickOutside?: boolean;
}

export interface RoleMemberPopoutProps {
    popoutProps: PopoutRenderProps;
    guildId: string;
    channelId: string;
    roleId: string;
}

export type Popout = ComponentType<PopoutProps> & {
    Animation: typeof PopoutAnimation;
};

export type RoleMemberPopout = ComponentType<RoleMemberPopoutProps>;
