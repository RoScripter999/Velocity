import type { ComponentType, PropsWithChildren, ReactNode, RefObject } from "react";
import type { LiteralUnion } from "type-fest";
import type { ButtonsProps, ButtonVariant } from "./Buttons";

type RenderFunction = (props: ModalProps) => ReactNode | Promise<ReactNode>;

export const enum ModalTransitionState {
    ENTERING,
    ENTERED,
    EXITING,
    EXITED,
    HIDDEN,
}

export interface ModalPropsRender {
    transitionState: ModalTransitionState;
    onClose(): void;
}

export interface ModalOptions {
    /** The key/id representing this modal, which is an auto generated number by default. */
    modalKey?: string;
    onCloseRequest?: (() => void);
    onCloseCallback?: (() => void);
    contextKey?: string;
    /** Whether {@link modalKey this} modal can be closed */
    dismissable?: boolean;
    /** Disables the modal opening animations */
    instant?: boolean;
    Layer?: ComponentType<{
        "aria-label"?: string;
        size?: "small" | "medium" | "large" | "dynamic";
        parentComponent?: string;
        children?: ReactNode;
    }>;
    backdropStyle?: string;
    /**
     * Stacking Behavior of the modal
     * - **stack**: Stacks {@link modalKey this} modal on top of another opened modal.
     * - **replace**: Replaces the last opened modal with {@link modalKey this} modal, When {@link modalKey this} modal closes the last modal will open back.
     * @default replace
    */
    stackingBehavior?: "stack" | "replace";
    /** Makes {@link modalKey this} modal stack on other modals by default. similar to {@link stackingBehavior} */
    stackNextByDefault?: boolean;
    allowsNavigation?: boolean;
}

/**
 * Modal with all options: https://files.catbox.moe/c8qxt0.png
 */
export interface ModalProps extends PropsWithChildren<ModalPropsRender> {
    size?: "sm" | "md" | "lg" | "xl" | "xxl";
    paddingSize?: "sm" | "lg";
    role?: "dialog" | "alertdialog";
    "aria-label"?: string;

    /**
     * Modal animation variant
     * - **default**: Modal is scaled with a small fade
     * - **subtle**: Modal only fades in and out
     */
    animationVariant?: "default" | "subtle";
    /** Maximum height mode @default "default" */
    maxHeight?: "default" | "viewport";
    /** Ref to return focus to when modal closes */
    returnRef?: RefObject<HTMLElement>;
    /** Whether modal can be dismissed by clicking outside or pressing escape @default true */
    dismissable?: boolean;
    /** Custom content rendered outside the main container */
    contentOutsideContainer?: ReactNode;

    title: ReactNode;
    /** Optional subtitle, will render below title (duh) */
    subtitle?: ReactNode;

    /**
     * Component that shows above the content. Seems like it's meant for some sort of lazy list rendering. listProps, onScroll and scrollerRef belong to this
     * I'd just avoid using this unless you know what you're doing
     */
    input?: ReactNode;
    listProps?: unknown;
    onScroll?: unknown;
    scrollerRef?: unknown;

    /** Component that shows below the content (children) and above the actions */
    preview?: ReactNode;

    /** Action buttons at the bottom of the Modal */
    actions?: ButtonsProps["Button"][];
    /** Velocity patched prop, Action buttons full width @default true */
    actionsFullWidth?: boolean;
    /** Custom component to show before actions, useful for e.g. "Don't show again" checkbox */
    actionBarInput?: ReactNode;
    /** Layout variant for action bar leading content @default "default" */
    actionBarInputLayout?: "default" | "chat-input";

    /** Shows a Notice (card) between (sub-)title and content (children) */
    notice?: {
        message: string;
        type: "critical" | "warning" | "info" | "success";
    };
}

/** Wrapper around Modal */
export interface ConfirmModalProps extends ModalProps {
    /** Variant for the confirm button, defaults to critical */
    variant?: ButtonVariant;
    confirmText: string;
    /** Defaults to "Cancel" */
    cancelText?: string;
    /**
     * If onConfirm runs without error, the modal will close.
     * To indicate an error, throw an Error. This will show the user a notice inside the Modal and keep it open.
     * This notice will either be a generic message if you just throw. If you call setError, it will show that message.
     * Even if you call setError, you still have to throw to keep the Modal open
     */
    onConfirm?(setError: (error: string) => void): void;
    /** Optional callback that runs when the user cancels the action. Whether provided or not, the Modal will close when user clicks Cancel. */
    onCancel?(): void;
    onCloseCallback?(): void;
    /** Checkbox that shows before the action buttons */
    checkboxProps?: {
        /** @default "Don't show again" */
        label?: string;
        checked: boolean;
        onChange(checked: boolean): void;
    };

}

export type MediaModalItem = {
    url: string;
    type: "IMAGE" | "VIDEO";
    original?: string;
    alt?: string;
    width?: number;
    height?: number;
    animated?: boolean;
    maxWidth?: number;
    maxHeight?: number;
} & Record<PropertyKey, any>;

export type MediaModalProps = {
    location?: string;
    contextKey?: string;
    onCloseCallback?: () => void;
    className?: string;
    items: MediaModalItem[];
    startingIndex?: number;
    onIndexChange?: (...args: any[]) => void;
    fit?: string;
    shouldRedactExplicitContent?: boolean;
    shouldHideMediaOptions?: boolean;
};

export interface LayerModalProps {
    transitionState: ModalTransitionState;
    animationVariant?: "default" | "subtle";
    "aria-label"?: string;
    onClose: () => void;
    returnRef?: Ref<HTMLElement>;
}

export interface MultiStepModalProps {
    steps: {
        stepKey: string;
        modalProps: {
            title?: ReactNode;
            subtitle?: ReactNode;
            /* HelpMessage component */
            notice?: {
                message: string;
                type: "warning";
            };
            /** Dynamic Graphics content. For more info look in dev://playground/mana/dynamic-graphic-modal */
            graphic?: ComponentType<any>;
        };
        body?: ReactNode;
        /** Whether the the next button should be enabled. @default true */
        nextEnabled?: boolean;
        /** guard before moving to next step */
        onNext?: () => boolean | Promise<boolean>;
        /** hides back button */
        hideBackButton?: boolean;
        backButtonProps?: ComponentProps<t.Buttons["TextButton"]>;
        nextButtonProps?: ComponentProps<t.Buttons["Button"]>;
        secondaryActionButtonProps?: ComponentProps<t.Buttons["Button"]>;
    }[];
    /** Must be a valid key from {@link steps} defined on stepKey. If invalid a "Step with key {keyName} not found" crash will occur */
    currentStepKey: string;
    /** Step keys shown as numbered progress, Only updates the progress bar. */
    numberedSteps?: string[];
    onStepChange?: (nextStepKey: string, currentStepKey: string) => void;
    onComplete?: () => void | Promise<void>;
    onClose?: () => void;
    dismissable?: boolean;

    size?: "sm" | "md" | "lg" | "xl" | "xxl";
    paddingSize?: "sm" | "lg";
    animationVariant?: ComponentProps<Modals["ModalRoot"]>["animation"];
    fullScreenOnMobile?: boolean;
    role?: ComponentProps<Modals["ModalRoot"]>["role"];
    maxHeight?: "default" | "viewport";
}

export interface ModalAPI {
    /**
     * Wait for the render promise to resolve, then open a modal with it.
     * This is equivalent to render().then(openModal)
     * You should use the Modal components exported by this file
     */
    openModalLazy: (render: () => Promise<RenderFunction>, options?: ModalOptions & { contextKey?: string; }) => Promise<string>;
    /**
     * Open a Modal with the given render function.
     * @returns A random number that up everytime, Acts as a key for other modals.
     */
    openModal: (render: RenderFunction, options?: ModalOptions, contextKey?: string) => string;
    /**
     * Close a modal by its key
     */
    closeModal: (modalKey: string, contextKey?: string) => void;
    /**
     * Close all open modals across all contexts
     */
    closeAllModals: () => void;
    /**
     * Close a modal by its key across all contexts (default and popout).
     * Useful when you don't know which context the modal was opened in
     */
    closeModalInAllContexts: (modalKey: string) => void;
    /**
     * Close all modals in a specific context.
     * Defaults to the current interacting context if none is provided
     */
    closeAllModalsInContext: (contextKey?: string) => void;
    /**
     * Update an existing modal's render function and optionally its close handlers,
     * without closing and reopening it, but its kinda useless because theres hooks
     */
    updateModal: (modalKey: string, render: RenderFunction, onCloseRequest?: () => void, onCloseCallback?: () => void, contextKey?: string) => void;
    /**
     * Check if a specific modal is currently open in a given context.
     * Defaults to the current interacting context if none is provided
     */
    hasModalOpen: (modalKey: string, contextKey?: string) => boolean;
    /**
     * Check if any modal is currently open across all contexts, including layer modals
     */
    hasAnyModalOpen: () => boolean;
    /**
     * Check if the top-most modal in the current context allows navigation.
     * Returns false if a popout context has any modals open
     */
    doesTopModalAllowNavigation: () => boolean;
    /**
     * Get the modal context key for the current interacting app context.
     * Automatically resolves between default and popout contexts.
     * In practice you rarely need this — all ModalAPI functions call it internally
     */
    getInteractingModalContext: () => string;
    /**
     * Convert an AppContext value to its corresponding modal context key.
     * Popout and non-overlay contexts map to the popout context key,
     * everything else maps to the default context key
     */
    modalContextFromAppContext: (appContext: Context<any>) => string;
    /**
     * Reactive hook version of {@link hasAnyModalOpen}.
     * Re-renders the component when the modal state changes
     */
    useHasAnyModalOpen: () => boolean;
    /**
     * Reactive hook version of {@link hasModalOpen}.
     * Re-renders the component when the modal state changes
     */
    useHasModalOpen: (modalKey: string, contextKey?: string) => boolean;
    /**
     * Reactive hook that returns true if the given modal key is
     * at the top of the stack in its context
     */
    useIsModalAtTop: (modalKey: string) => boolean;
    /**
     * Selector version of {@link hasAnyModalOpen}.
     * Returns true if any context has at least one modal open
     */
    hasAnyModalOpenSelector: (state: Record<string, ModalOptions[]>) => boolean;
    /**
     * Selector version of {@link hasModalOpen}.
     * Returns true if the given modal key is open in the specified context
     */
    hasModalOpenSelector: (state: Record<string, ModalOptions[]>, modalKey: string, contextKey?: string) => boolean;
}

export type Modal = ComponentType<ModalProps>;
export type ConfirmModal = ComponentType<ConfirmModalProps>;
export type LayerModal = ComponentType<LayerModalProps>;
export type MultiStepModal = ComponentType<MultiStepModalProps>;
