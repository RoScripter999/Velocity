import type { ComponentType, ReactElement, ReactNode } from "react";
import type { Field, IconProps } from "../components";
import type { IconProps as IconPropsVelocity } from "@components/Icons";

type SelectAccessory =
    | { type: "image"; src: string; }
    | { type: "avatar"; src: string; }
    | { type: "badge"; badgeType: "new" | "beta" | "early_access" | "free_trial"; }
    | ComponentType<IconProps> | ComponentType<IconPropsVelocity>;

export interface SelectOption {
    /**
     * Unique identifier for the option
     * It must be provided unless {@link SelectProps.formatOption formatOption} handles it.
     *
     * @warning Will cause all options to show `✓` if not provided.
     */
    id?: string;
    value: any;
    label: ReactNode;
    description?: string;
    disabled?: boolean;
    leading?: SelectAccessory;
    trailing?: SelectAccessory;
}

export interface SelectOptionGroup {
    label: ReactNode;
    /** List of options inside this group */
    options: SelectOption[];
}

export type SelectProps<Options extends SelectOption | SelectOptionGroup = SelectOption | SelectOptionGroup> = (Field extends ComponentType<infer P> ? P : {}) & {
    /**
     * Mode of option selection.
     * @default "single"
     */
    selectionMode?: "single" | "multiple";
    readOnly?: boolean;
    clearable?: boolean;
    /** Expands component to fill container width */
    fullWidth?: boolean;
    /**
     * Closes the dropdown menu upon selecting an option
     * @default true
     */
    closeOnSelect?: boolean;
    /** Enables keyboard navigation wrapping between options */
    shouldFocusWrap?: boolean;
    /** Placeholder text when no value is selected */
    placeholder?: string;
    /**
     * Maximum visible options rendered in the list
     * @default 5
     */
    maxOptionsVisible?: number;
    /**
     * Fits input width to content length
     * @default false
     */
    fitContent?: boolean;
    options: Options[] | (() => Promise<Options[]>) | (() => Options[]);
    /**
     * Function that extends the options into a singular table based on existing options.
     * Allowing to pass/remove special option params without needing to put/remove in every option.
     *
     * This is mostly used for passing `id` to all the options as their `value`
     * @default this
     */
    formatOption?: (option: Options extends SelectOptionGroup ? SelectOptionGroup : SelectOption) => Partial<SelectOption | SelectOptionGroup>;
    onSelectionChange?: (value: any) => void;
    value: any;
    /**
     * Wraps tags into multiple lines in multiple selection mode
     * @default false
     */
    wrapTags?: boolean;
    /**
     * Visual style variant of the component
     * @default "default"
     */
    variant?: "default" | "filled" | "subtle";
};

export type Select = <T extends SelectOption | SelectOptionGroup>(props: SelectProps<T>) => ReactElement;

export type SearchableSelect = <T extends SelectOption | SelectOptionGroup>(props: Omit<SelectProps<T>, "selectionMode"> & {
    /**
     * Mode of option selection.
     * @default "multiple"
     */
    selectionMode?: "single" | "multiple";
    hideTags?: boolean;
}) => ReactElement;
