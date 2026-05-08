/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 Velocitcs and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import type * as t from "@velocity-types";
import { filters, findByCodeLazy, findComponentByCodeLazy, mapMangledModuleLazy } from "@webpack";
import type { ComponentProps, ComponentType, Context, PropsWithChildren, ReactNode, Ref } from "react";

import { LazyComponent } from "./react";


export const enum ModalSize {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    DYNAMIC = "dynamic",
}

export type ModalCloseSize =
    | "xxs"
    | "xs"
    | "sm"
    | "refresh_sm"
    | "md"
    | "lg"
    | "custom";


const enum ModalTransitionState {
    ENTERING,
    ENTERED,
    EXITING,
    EXITED,
    HIDDEN,
}


export interface ModalProps {
    transitionState: ModalTransitionState;
    onClose(): void;
}

export type Layer = ComponentType<{
    "aria-label"?: string;
    size?: "small" | "medium" | "large" | "dynamic";
    parentComponent?: string;
    children?: ReactNode;
}>;

export interface ModalOptions {
    modalKey?: string;
    onCloseRequest?: (() => void);
    onCloseCallback?: (() => void);
    contextKey?: string;
    dismissable?: boolean;
    instant?: boolean;
    Layer?: Layer;
    backdropStyle?: string;
    stackingBehavior?: "stack" | "replace";
    stackNextByDefault?: boolean;
    allowsNavigation?: boolean;
}

type RenderFunction = (props: ModalProps) => ReactNode | Promise<ReactNode>;

interface Modals {
    ModalRoot: ComponentType<PropsWithChildren<{
        transitionState: ModalTransitionState;
        size?: ModalSize;
        role?: "alertdialog" | "dialog";
        className?: string;
        fullscreenOnMobile?: boolean;
        hideShadow?: boolean;
        "aria-label"?: string;
        "aria-labelledby"?: string;
        onAnimationEnd?(): void;
        animation?: "default" | "subtle";
        returnRef?: Ref<HTMLElement>;
        parentComponent?: string;
    }>>;
    ModalHeader: ComponentType<PropsWithChildren<{
        /** FlexClasses.Justify.START */
        justify?: string;
        /** FlexClasses.Direction.HORIZONTAL */
        direction?: string;
        /** FlexClasses.Align.CENTER */
        align?: string;
        /** FlexClasses.Wrap.NO_WRAP */
        wrap?: string;
        separator?: boolean;
        id?: string;
        className?: string;
        headerId?: string;
    }>>;
    /** This also accepts Scroller props but good luck with that */
    ModalContent: ComponentType<PropsWithChildren<{
        className?: string;
        scrollerRef?: Ref<HTMLElement>;
        scrollbarType?: "auto" | "thin" | "none";
        "data-migration-pending"?: boolean;
        [prop: string]: any;
    }>>;
    ModalFooter: ComponentType<PropsWithChildren<{
        /** FlexClasses.Justify.START */
        justify?: string;
        /** FlexClasses.Direction.HORIZONTAL_REVERSE */
        direction?: string;
        /** FlexClasses.Align.STRETCH */
        align?: string;
        /** FlexClasses.Wrap.NO_WRAP */
        wrap?: string;
        separator?: boolean;
        "data-migration-pending"?: boolean;
        className?: string;
    }>>;
    ModalCloseButton: ComponentType<{
        focusProps?: any;
        onClick(): void;
        withCircleBackground?: boolean;
        hideOnFullscreen?: boolean;
        className?: string;
        innerClassName?: string;
        variant?: "default" | "icon-only";
        size?: ModalCloseSize;
        "aria-label"?: string;
        "data-migration-pending"?: boolean;
    }>;
}

export const Modals: Modals = mapMangledModuleLazy(".MODAL_ROOT_LEGACY,", {
    ModalRoot: filters.componentByCode("({headerId:"),
    ModalHeader: filters.componentByCode(",id:"),
    ModalContent: filters.componentByCode("scrollbarType:"),
    ModalFooter: filters.componentByCode(".HORIZONTAL_REVERSE,"),
    ModalCloseButton: filters.componentByCode(".withCircleBackground")
});

export const ModalRoot = LazyComponent(() => Modals.ModalRoot);
export const ModalHeader = LazyComponent(() => Modals.ModalHeader);
export const ModalContent = LazyComponent(() => Modals.ModalContent);
export const ModalFooter = LazyComponent(() => Modals.ModalFooter);
export const ModalCloseButton = LazyComponent(() => Modals.ModalCloseButton);

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

// Modal key: "Media Viewer Modal"
export const openMediaModal: (props: MediaModalProps) => void = findByCodeLazy("hasMediaOptions", "shouldHideMediaOptions");

export interface LayerModalProps {
    transitionState: ModalTransitionState;
    animationVariant?: "default" | "subtle";
    "aria-label"?: string;
    onClose: () => void;
    returnRef?: Ref<HTMLElement>;
}

export const LayerModal = findComponentByCodeLazy<LayerModalProps>('"data-mana-component":"layer-modal",');

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

export const MultiStepModal = findComponentByCodeLazy<MultiStepModalProps>("progressBarProps", '"graphic"in');

interface ModalAPI {
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

export const ModalAPI: ModalAPI = mapMangledModuleLazy(".modalKey?", {
    openModalLazy: filters.byCode(".modalKey?"),
    openModal: filters.byCode(",instant:"),
    closeModal: filters.byCode(".onCloseCallback()"),
    closeAllModals: filters.byCode(".getState();for"),
    closeModalInAllContexts: filters.byCode("onCloseCallback?.()"),
    closeAllModalsInContext: filters.byCode("getState()[", "for(let"),
    updateModal: filters.byCode("render:", "onCloseRequest", "onCloseCallback"),
    hasModalOpen: filters.byCode(/\w+\.getState\(\),\w+,\w+/),
    hasAnyModalOpen: filters.byCode(/return \w+\(\w+\.getState\(\)\)/),
    doesTopModalAllowNavigation: filters.byCode("allowsNavigation", "return!1"),
    getInteractingModalContext: filters.byCode(/null!=\w+\?\w+\(\w+\)/),
    modalContextFromAppContext: filters.byCode("__OVERLAY__", "switch("),
    useHasAnyModalOpen: filters.byCode(/return \w+\(\w+\(\)\)/, /^(?!.*getState).*/),
    useHasModalOpen: filters.byCode(/return \w+\(\w+\(\),\w+,\w+\)/),
    hasAnyModalOpenSelector: filters.byCode("for(let t of"),
    hasModalOpenSelector: filters.byCode("some(", "key==="),
    useIsModalAtTop: filters.byCode("at(-1)?.key===")
});

export const { openModalLazy, openModal, closeModal, closeAllModals, closeModalInAllContexts, closeAllModalsInContext, updateModal, hasModalOpen, hasAnyModalOpen, doesTopModalAllowNavigation, getInteractingModalContext, modalContextFromAppContext, useHasAnyModalOpen, useHasModalOpen, useIsModalAtTop, hasAnyModalOpenSelector, hasModalOpenSelector } = ModalAPI;
