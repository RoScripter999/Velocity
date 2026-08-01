import type { ChangeEvent, ComponentType, FocusEvent, KeyboardEvent, ReactElement, ReactNode } from "react";
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

type StrictOptions<T, K extends string = never> = T extends SelectOptionGroup
    ? Exclude<keyof T, keyof SelectOptionGroup | K> extends never ? Omit<T, "options"> & { options: StrictOptions<T["options"][number], K>[]; } : SelectOptionGroup
    : T extends SelectOption ? T : SelectOption;

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
    /**
     * Placeholder text when no value or query is selected
     * @default "Select..."
     */
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

export type SearchableSelectProps<
    Options extends SelectOption | SelectOptionGroup = SelectOption | SelectOptionGroup,
    Keys extends string = string
> = Omit<SelectProps<StrictOptions<Options, Keys>>, "selectionMode"> & {
    /**
     * Mode of option selection.
     * @default undefined
     */
    selectionMode?: "single" | "multiple";
    /**
     * Hides tags from appearing, this only works when {@link SearchableSelectProps.selectionMode selectionMode} is set to `multiple` or `undefined`
     */
    hideTags?: boolean;
    autoFocus?: boolean;
    onQueryChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    /**
     * Overrides the default search completely. Takes the options and search query and returns the filtered options.
     * It can also use the {@link SearchableSelectProps.matchSorterOptions matchSorterOptions} custom options
     * @param options List of options to filter.
     * @param query Search query text typed by the user.
     */
    customMatchSorter?: (
        options: (Options extends SelectOptionGroup ? SelectOption & Partial<Record<Keys, any>> : StrictOptions<Options, Keys>)[],
        query: string
    ) => (Options extends SelectOptionGroup ? SelectOption : Options)[];
    /**
     * Configures which properties on option objects are searched when typing.
     *
     * @example ```["keywords"]``` Allows searching by `keywords` property
     * @default ["label"]
     */
    matchSorterOptions?: {
        keys?: (Keys | (Options extends { options: Array<infer Item>; } ? keyof Item : keyof Options) | keyof SelectOption)[];
    };
};

export type Select = <T extends SelectOption | SelectOptionGroup>(props: SelectProps<StrictOptions<T>>) => ReactElement;
export type SearchableSelect = <
    T extends SelectOption | SelectOptionGroup,
    K extends string = never
>(props: SearchableSelectProps<T, K>) => ReactElement;
