import { ComponentType, PropsWithChildren, CSSProperties, ReactNode } from "react";
import { Field } from "../components";

export type TextInputProps = PropsWithChildren<(Field extends ComponentType<infer P> ? Omit<P, "errorMessage"> : {}) & {
    name?: string;
    value?: string | number;
    defaultValue?: string;
    onChange?(value: string, name?: string): void;

    placeholder?: string;
    autoFocus?: boolean;
    type?: "text" | "password" | "email" | "number";
    editable?: boolean;
    disabled?: boolean;
    spellCheck?: boolean;
    readOnly?: boolean;

    maxLength?: number | null;
    minLength?: number;
    error?: string;
    validateOn?: "change" | "blur";
    defaultDirty?: boolean;

    onBlur?(event: FocusEvent<HTMLInputElement>): void;
    onFocus?(event: FocusEvent<HTMLInputElement>): void;
    onKeyDown?(event: KeyboardEvent<HTMLInputElement>): void;
    onClear?(event: MouseEvent<HTMLElement>): void;

    size?: "md" | "sm";
    fullWidth?: boolean;
    showCharacterCount?: boolean;
    clearable?: boolean | { show: boolean; };

    inputRef?: Ref<HTMLInputElement>;
    focusProps?: any;
    className?: string;
    id?: string;
    "aria-label"?: string;
    role?: string;
    style?: CSSProperties;

    leading?: string | {
        type: "tags";
        label: string;
        items: Array<{
            id: string;
            label: string;
            icon?: ComponentType<{ size?: string; color?: string; }>;
        }>;
        onRemove?: (ids: Set<string>) => void;
    } | {
        type?: "icon";
        icon: ComponentType<{ size?: string; color?: string; }>;
        onClick?: (e: MouseEvent) => void;
        "aria-label"?: string;
        tooltip?: string;
    } | {
        type: "image";
        src: string;
    } | ComponentType<{ size?: string; color?: string; }>;

    trailing?: string | {
        type: "button";
        button: ReactNode;
    } | {
        type: "tags";
        label: string;
        items: Array<{
            id: string;
            label: string;
            icon?: ComponentType<{ size?: string; color?: string; }>;
        }>;
        onRemove?: (ids: Set<string>) => void;
    } | {
        type?: "icon";
        icon: ComponentType<any>;
        disabled?: boolean;
        onClick?: (e: UIEvent) => void;
        "aria-label"?: string;
        tooltip?: string;
    } | {
        type: "image";
        src: string;
    } | ComponentType<{ size?: string; color?: string; }>;
}>;

export type TextInput = ComponentType<TextInputProps>;
