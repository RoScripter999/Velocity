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

import "./AlertModal.css";

import { isTruthy } from "@utils/guards";
import { ModalContent, ModalFooter, type ModalProps, ModalRoot, openModal } from "@utils/modal";
import { Buttons, Clickable, FlexClasses, Text } from "@webpack/common";
import type { ReactNode } from "react";

import { Flex } from "./Flex";
import { Grid } from "./Grid";
import { Margins } from "./margins";
import { Paragraph } from "./Paragraph";

interface AlertProps {
    title: ReactNode;
    body: ReactNode;
    cancelText?: string;
    confirmText?: string;
    secondaryConfirmText?: string;
    onCancel?(): void;
    onConfirm?(): void;
    onConfirmSecondary?(): void;
    onCloseCallback?(): void;
}

export function AlertModal(props: AlertProps & { modalProps: ModalProps; }) {
    const { body, title, cancelText, confirmText, onCancel, onCloseCallback, onConfirm, onConfirmSecondary, secondaryConfirmText, modalProps } = props;

    const handleClose = () => {
        modalProps.onClose();
        onCloseCallback?.();
    };

    const handleCancel = () => {
        handleClose();
        onCancel?.();
    };

    const handleConfirm = () => {
        handleClose();
        onConfirm?.();
    };

    const handleSecondaryConfirm = () => {
        handleClose();
        onConfirmSecondary?.();
    };

    const buttons = [
        cancelText && <Buttons.Button key="cancel" variant="secondary" text={cancelText} onClick={handleCancel} />,
        confirmText && <Buttons.Button key="confirm" variant="primary" text={confirmText} onClick={handleConfirm} />
    ].filter(isTruthy);

    return (
        <ModalRoot {...modalProps}>
            <ModalContent>
                <Text tag="h2" variant="text-lg/bold" className="vc-alert-title">{title}</Text>
                <Paragraph className="vc-alert-body">{body}</Paragraph>
            </ModalContent>

            <ModalFooter align={FlexClasses.Align.STRETCH}>
                <div className="vc-alert-footer">
                    {buttons.length > 0 && <Grid columns={buttons.length} gap="8px">{buttons}</Grid>}

                    {secondaryConfirmText && (
                        <Flex justifyContent="center" flexWrap="wrap" className={buttons.length > 0 ? Margins.top8 : undefined}>
                            {!!secondaryConfirmText && (
                                <Clickable onClick={handleSecondaryConfirm} className="vc-alert-secondaryConfirm">
                                    <Text variant="text-xs/medium" className="vc-alert-secondaryConfirm-text">{secondaryConfirmText}</Text>
                                </Clickable>
                            )}
                        </Flex>
                    )}
                </div>
            </ModalFooter>
        </ModalRoot>
    );
}

export function showAlert(props: AlertProps) {
    openModal(modalProps => <AlertModal {...props} modalProps={modalProps} />);
}
