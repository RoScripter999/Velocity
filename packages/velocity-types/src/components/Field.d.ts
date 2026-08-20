import { ComponentType, CSSProperties, ReactNode, Ref } from "react";
import { TextVariant } from "../components";

export type BadgeType = "new" | "beta" | "early_access" | "free_trial";

export interface FieldProps {
    label?: ReactNode;
    hideLabel?: boolean;
    /** Puts a asterisk in text-feedback-critical color on the right side of the {@link label} */
    required?: boolean;
    disabled?: boolean;
    description?: ReactNode;
    /** Displayed below the control or label depending on {@link auxiliaryContentPosition} */
    helperText?: string;
    /**
    * Used to connect interactive components, such as {@link TextInput} and other Form based components.
    * When the IDs match, it links the label and other associated elements to the child control.
    * You can also just use the `controlId` directly, which is a litle better method.
    */
    id?: string;
    /** Renders a critical/red error message, takes priority over {@link helperText} and {@link successMessage} */
    errorMessage?: string;
    /** Renders a positive/green success message, takes priority over {@link helperText} */
    successMessage?: string;
    /** @default vertical */
    layout?: "vertical" | "horizontal" | "horizontal-responsive";
    layoutConfig?: {
        /** CSS value for the control column width in horizontal layouts, e.g. `"200px"` */
        horizontalControlColumnWidth?: CSSProperties["width"];
    };
    badge?: BadgeType | { type: BadgeType, variant?: TextVariant, icon?: ComponentType<any>; };
    /** Icon rendered to the left of the label text */
    icon?: ComponentType<any>;
    /** Makes the label element respond to hover/interaction states */
    interactiveLabel?: boolean;
    /** Where to put the {@link trailingAuxiliaryContent}. @default under-control */
    auxiliaryContentPosition?: "under-control" | "under-label";
    /** Extra content rendered after the helper/error/success message row */
    trailingAuxiliaryContent?: ReactNode;
    /** `group` renders the Field as a div, while a `radiogroup` renders the Field as a fieldset. */
    role?: "group" | "radiogroup";
    ref?: Ref<HTMLDivElement | HTMLFieldSetElement>;
    "aria-describedby"?: string;
    children?: ReactNode | ((context: {
        labelId: string;
        controlId: string;
        /** Combined id referencing all descriptive elements (description, helper, error) for use on the control's `aria-describedby` */
        describedById: string | undefined;
        errorMessageId: string | undefined;
        helperTextId: string | undefined;
        descriptionId: string | undefined;
        /** True when {@link trailingAuxiliaryContent} is provided */
        hasTrailingAuxiliaryContent: boolean;
        isLabelHovered: boolean;
        setIsLabelHovered: (hovered: boolean) => void;
    }) => ReactNode);
}

export type Field = ComponentType<FieldProps>;
