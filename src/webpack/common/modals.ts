/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 RoScripter999 and contributors
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
import { filters, findByCodeLazy, findComponentByCodeLazy, findExportedComponentLazy, mapMangledModuleLazy, proxyLazyWebpack } from "@webpack";

export const Modal: t.Modal = findExportedComponentLazy("Modal");
export const ConfirmModal: t.ConfirmModal = findExportedComponentLazy("ConfirmModal");

// Modal key: "Media Viewer Modal"
export const openMediaModal: (props: t.MediaModalProps) => void = findByCodeLazy("hasMediaOptions", "shouldHideMediaOptions");

/** @ignore This is an experimental component, Lazy loaded from playgrounds. */
export const MultiStepModal = proxyLazyWebpack<t.MultiStepModal>(() => findComponentByCodeLazy(".stepKey==="));

/** @ignore This is an experimental component, If you'd like you can finish the prop typings. */
export const LayerModal = proxyLazyWebpack<t.LayerModal>(() => findComponentByCodeLazy('"data-mana-component":"layer-modal",'));

export const ModalAPI: t.ModalAPI = mapMangledModuleLazy(".modalKey?", {
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
