import { ComponentType, CSSProperties, HTMLProps, PropsWithChildren, ReactNode } from "react";

export type HeadingTag = `h${1 | 2 | 3 | 4 | 5 | 6}`;

export interface FormsProps {
    FormTitle: HTMLProps<HTMLTitleElement> & PropsWithChildren<{
        /** Variant of the title, For more info look here: `dev://playground/void/formtitle`. @default h5 */
        tag?: HeadingTag;
        title?: string;
        disabled?: boolean;
        required?: boolean;
        /** Short terms for "errorMessage" in most components. */
        error?: ReactNode;
        errorId?: string;
        className?: string;
        style?: CSSProperties;
    }>;
    FormSection: PropsWithChildren<{
        /** Variant of the title, Same as {@link FormTitle} */
        tag?: HeadingTag | "legend";
        className?: string;
        titleClassName?: string;
        titleId?: string;
        title?: ReactNode;
        disabled?: boolean;
        required?: boolean;
        error?: ReactNode;
        errorId?: string;
        isFocused?: boolean;
        setIsFocused?: (focused: boolean) => void;
        hasValue?: boolean;
        setHasValue?: (hasValue: boolean) => void;
        htmlFor?: string;
    }>;
    FormDivider: {
        className?: string;
        /** Creates a gap using margin-bottom and margin-top that are equal. */
        gap?: CSSProperties["gap"];
    };
}

export type Forms = {
    FormTitle: ComponentType<FormsProps["FormTitle"]>;
    FormSection: ComponentType<FormsProps["FormSection"]>;
    FormDivider: ComponentType<FormsProps["FormDivider"]>;
};
