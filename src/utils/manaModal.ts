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

import { findComponentByCodeLazy } from "@webpack";
import type { ButtonHTMLAttributes, ComponentType, CSSProperties, PropsWithChildren, ReactNode, Ref } from "react";


const enum ModalTransitionState {
    ENTERING,
    ENTERED,
    EXITING,
    EXITED,
    HIDDEN
}

export interface ManaModalProps {
    transitionState?: ModalTransitionState | number;
    onClose(): void;

    size?: "sm" | "md" | "lg";
    paddingSize?: "sm" | "md" | "lg";
    fullScreenOnMobile?: boolean;
    role?: "dialog" | "alertdialog";
    "aria-label"?: string;
    dismissable?: boolean;
    children?: ReactNode;
}

interface ManaModals {
    ManaModalRoot: ComponentType<PropsWithChildren<{
        transitionState?: ModalTransitionState;
        onClose(): void;
        /** Size of the modal. @default md */
        size?: "sm" | "md" | "lg";
        /** padding of the modal. @default sm */
        paddingSize?: "sm" | "md" | "lg";
        fullScreenOnMobile?: boolean;
        role?: "dialog" | "alertdialog";
        "aria-label"?: string;
        dismissable?: boolean;
    }>>;

    ManaModalContent: ComponentType<PropsWithChildren<{
        controls?: ReactNode;
        listProps?: {
            sections: Array<{
                section?: number;
                type: "section" | "row" | "footer" | "header";
            }>;
            sectionHeight: number;
            rowHeight?: number;
            footerHeight?: number;
            sidebarHeight?: number;
            listHeaderHeight?: number;
            renderSection?: (item: { section?: number; type: "section"; }) => ReactNode;
            renderRow?: (item: { section?: number; type: "row"; }) => ReactNode;
            renderFooter?: (item: { section?: number; type: "footer"; }) => ReactNode;
            renderSidebar?: (isListVisible: boolean, isSidebarVisible: boolean) => ReactNode;
            renderListHeader?: () => ReactNode;
            stickyListHeader?: boolean;
            wrapSection?: (section: number, rows: ReactNode[]) => ReactNode;
            getAnchorId?: (item: { section?: number; type: string; }) => string;
            paddingTop?: number;
            paddingBottom?: number;
            chunkSize?: number;
            ref?: Ref<HTMLElement>;
            onScroll?: (e: UIEvent) => void;
            innerRole?: string;
            innerAriaOrientation?: string;
        };
        onScroll?: () => void;
        scrollerRef?: Ref<HTMLElement>;
    }>>;

    ManaModalHeader: ComponentType<PropsWithChildren<{
        title: string;
        subtitle?: string;
        trailing?: ReactNode;
        leading?: ReactNode;
        gradientColor?: string;
    }>>;

    ManaModalFooter: ComponentType<PropsWithChildren<{
        leading?: ReactNode;
        actions?: Array<{
            text?: string;
            icon?: ComponentType<any> | ReactNode;
            variant?: "primary" | "secondary" | "critical-primary" | "expressive" | (string & {});
            onClick?: (e?: MouseEvent) => void;
            disabled?: boolean;
            autoFocus?: boolean;
            fullWidth?: boolean;
            ariaLabel?: string;
            id?: string;
            className?: string;
            type?: ButtonHTMLAttributes<any>["type"];
            style?: CSSProperties;
        }>;
        actionsFullWidth?: boolean;
    }>>;
}

export const ManaModals: ManaModals = {
    ManaModalRoot: findComponentByCodeLazy('"data-mana-component":"modal"', "dismissable:"),
    ManaModalHeader: findComponentByCodeLazy("headerLayout", "headerMain", "headerTitle"),
    ManaModalContent: findComponentByCodeLazy(",{controls:", '"string"==typeof'),
    ManaModalFooter: findComponentByCodeLazy("actionBar", "actionBarTrailing")
};

export const ManaModalRoot = ManaModals.ManaModalRoot;
export const ManaModalHeader = ManaModals.ManaModalHeader;
export const ManaModalContent = ManaModals.ManaModalContent;
export const ManaModalFooter = ManaModals.ManaModalFooter;
