import { ButtonHTMLAttributes, ComponentType, CSSProperties, KeyboardEvent, MouseEvent, PropsWithChildren, Ref } from "react";
import { TextVariant } from "../components";

export type ButtonVariant = "primary" | "secondary" | "critical-primary" | "critical-secondary" | "active" | "overlay-primary" | "overlay-secondary" | "expressive";

type Booleanish = boolean | "true" | "false";

export interface ButtonsProps {
    Button: {
        /** @ignore You probably dont need to use this. @default button */
        role?: string;
        /** Background color variant of the button. @default primary */
        variant?: ButtonVariant;
        /** Size of the button @default md */
        size?: "xs" | "sm" | "md";
        text?: string;
        icon?: ComponentType<any>;
        /** Positions where {@link icon} is positioned. @default start */
        iconPosition?: "start" | "end";
        /** Adds offset margin to the {@link icon}. @default 0 */
        iconOpticalOffsetMargin?: number;
        /** Makes the button on its full size in a element. @default false */
        fullWidth?: Booleanish;
        focusProps?: Record<string, any>;
        loading?: Booleanish;
        /** @ignore Only used when the user's device narrator settings is on. */
        loadingStartedLabel?: string;
        /** @ignore Only used when the user's device narrator settings is on. */
        loadingFinishedLabel?: string;
        /** Rounds the button @default false */
        rounded?: Booleanish;
        /** type click. @default button */
        type?: ButtonHTMLAttributes<any>["type"];
        disabled?: Booleanish;
        /** Minimum size of the button. Note: numbers get converted into CSS automatically. */
        minWidth?: CSSProperties["minWidth"];
        style?: CSSProperties;
        buttonRef?: Ref<HTMLButtonElement>;
        onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
        onDoubleClick?: (e: MouseEvent<HTMLButtonElement>) => void;
        onMouseEnter?: (e: MouseEvent<HTMLButtonElement>) => void;
        onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void;
        onMouseUp?: (e: MouseEvent<HTMLButtonElement>) => void;
        onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void;
        onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
        onContextMenu?: (e: MouseEvent<HTMLButtonElement>) => void;
    };
    TextButton: {
        /** Limits how many downlines the text creates when too long. */
        lineClamp?: number;
        /** If not provided nothing renders. */
        text?: string;
        textVariant?: TextVariant;
        /** type click. @default button */
        type?: ButtonHTMLAttributes<any>["type"];
        /** Background color variant of the text. @default primary */
        variant?: "primary" | "secondary" | "always-white" | "critical";
        disabled?: Booleanish;
        buttonRef?: Ref<HTMLButtonElement>;
        onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    };
    IconButton: {
        role?: ButtonHTMLAttributes;
        /** Background color variant of the button. @default primary */
        variant?: "primary" | "secondary" | "critical-primary" | "critical-secondary" | "active" | "overlay-primary" | "overlay-secondary" | "icon-only";
        /** Size of the button @default md */
        size?: "xs" | "sm" | "md";
        icon?: ComponentType<any>;
        disabled?: Booleanish;
        /** Creates a spinning animation on the button for loading animations */
        loading?: Booleanish;
        focusProps?: Record<string, any>;
        buttonRef?: Ref<HTMLButtonElement>;
        onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
        onMouseEnter?: (e: MouseEvent<HTMLButtonElement>) => void;
        onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void;
    };
    ButtonGroup: {
        /** Which HTML element the {@link ButtonGroup} is. @default div  */
        as?: "div" | "span" | "section";
        /** Gap between each element. Note: this is NOT {@link CSSProperties}. @default "8" */
        gap?: string;
        /** The direction the children are gonna be placed on. @default vertical*/
        direction?: "horizontal" | "vertical";
        /** Where to align the items at. @default stretch */
        align?: "start" | "center" | "end" | "stretch";
        /** Aligns items along the main axis: start, center, end, or distribute space. etc. @default start */
        justify?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
        /** Keeps all children inside the {@link ButtonGroup} element */
        wrap?: Booleanish;
        /** Applies a standard {@link CSSProperties CSS} padding with a direction control */
        padding?: number | {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
        };
        /** Makes the {@link ButtonGroup} container on its full size in a element. @default true */
        fullWidth?: Booleanish;
        className?: string;
        style?: CSSProperties;
    };
}

export type Buttons = {
    Button: ComponentType<ButtonsProps["Button"]>;
    TextButton: ComponentType<ButtonsProps["TextButton"]>;
    IconButton: ComponentType<PropsWithChildren<ButtonsProps["IconButton"]>>;
    ButtonGroup: ComponentType<PropsWithChildren<ButtonsProps["ButtonGroup"]>>;
};
