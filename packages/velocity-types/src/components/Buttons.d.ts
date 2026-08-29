import { ButtonHTMLAttributes, AriaAttributes, ComponentType, CSSProperties, HTMLAttributes, PropsWithChildren, Ref } from "react";
import { TextVariant } from "../components";

export type ButtonVariant = "primary" | "secondary" | "critical-primary" | "critical-secondary" | "active" | "overlay-primary" | "overlay-secondary" | "expressive" | "togglebutton" | "icon-only" | "color-mix";

type Booleanish = boolean | "true" | "false";
type SpaceValue = 0 | 4 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 26 | 30 | 32 | 40 | 48 | 64 | 80 | 96 | 128 | 160 | 192;

export interface ButtonsProps {
    Button: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "className", "aria-pressed"> & {
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
        /** FocusRing props, look in button's wrapper component. */
        focusProps?: Record<string, any>;
        loading?: Booleanish;
        /** @ignore Only used when the user's device narrator settings is on. */
        loadingStartedLabel?: string;
        /** @ignore Only used when the user's device narrator settings is on. */
        loadingFinishedLabel?: string;
        /** Rounds the button even though it's already round..? @default false */
        rounded?: Booleanish;
        disabled?: Booleanish;
        /** Minimum size of the button's width. */
        minWidth?: CSSProperties["minWidth"];
        buttonRef?: Ref<HTMLButtonElement>;
        /** Indicates the current "pressed" state of buttons with togglebutton variant. */
        "aria-pressed": AriaAttributes["aria-pressed"];
    };
    TextButton: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role" | "className" | "style"> & {
        /** Limits how many downlines the text creates when too long. */
        lineClamp?: number;
        /** If not provided nothing renders. */
        text?: string;
        textVariant?: TextVariant;
        /** Background color variant of the text. @default primary */
        variant?: "primary" | "secondary" | "always-white" | "critical";
        disabled?: Booleanish;
        buttonRef?: Ref<HTMLButtonElement>;
    };
    IconButton: Omit<ButtonsProps["Button"], "text" | "fullWidth">;
    ButtonGroup: HTMLAttributes<HTMLElement> & {
        /** Which HTML element the {@link ButtonGroup} is. @default div  */
        as?: "div" | "span" | "section";
        /**
         * Gap between each element.
         * Component uses var(--space-NUMBER) style variable, so unfortunately this cant just be any number/string.
         */
        gap?: SpaceValue | `${SpaceValue}`;
        /** The direction the children are gonna be placed on. @default vertical*/
        direction?: "horizontal" | "vertical";
        /** Where to align the items at. @default stretch */
        align?: "start" | "center" | "end" | "stretch";
        /** Aligns items along the main axis: start, center, end, or distribute space. etc. @default start */
        justify?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
        /** Keeps all children inside the {@link ButtonGroup} element */
        wrap?: Booleanish;
        /** Applies a standard {@link CSSProperties CSS} padding with a direction control */
        padding?: SpaceValue | `${SpaceValue}` | Partial<Record<"top" | "right" | "bottom" | "left", SpaceValue | `${SpaceValue}`>>;
        /** Makes the {@link ButtonGroup} container on its full size in a element. @default true */
        fullWidth?: Booleanish;
    };
}

export type Buttons = {
    Button: ComponentType<ButtonsProps["Button"]>;
    TextButton: ComponentType<ButtonsProps["TextButton"]>;
    IconButton: ComponentType<PropsWithChildren<ButtonsProps["IconButton"]>>;
    ButtonGroup: ComponentType<PropsWithChildren<ButtonsProps["ButtonGroup"]>>;
};
