import { ComponentType, CSSProperties, FocusEvent, HTMLProps, KeyboardEvent, MouseEvent, PropsWithChildren, ReactNode, Ref } from "react";
import { FieldProps } from "../components";

export interface TextInputProps extends PropsWithChildren, Omit<FieldProps, "errorMessage"> {
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
}

export interface SearchBarProps {
    query: string;
    onChange: (query: string) => void;
    onClear?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    onKeyDown?: (e: KeyboardEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    autoComplete?: string;
    inputProps?: TextInputProps;
    "aria-label"?: string;
    ref?: Ref<HTMLInputElement>;
}

export interface FilePickerProps {
    filename: string;
    className?: string;
    filters?: Array<{
        name: string;
        extensions: string[];
    }>;
    buttonText: string;
    placeholder: string;
    onFileSelect: (file: File | undefined) => void;
}

export interface TextAreaProps extends Omit<HTMLProps<HTMLTextAreaElement>, "onChange">, Omit<FieldProps, "errorMessage"> {
    onChange(v: string): void;
    inputRef?: Ref<HTMLTextAreaElement>;
    error?: string;
}

// These are still considered a TextInput since it uses the same component/design.
export type TextArea = ComponentType<TextAreaProps>;
export type FilePicker = ComponentType<FilePickerProps>;
export type SearchBar = ComponentType<SearchBarProps>;

export type TextInput = ComponentType<TextInputProps>;
