/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 Velocitcs and contributors
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

import ErrorBoundary from "@components/ErrorBoundary";
import { ModalCloseButton, ModalContent, ModalHeader, type ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { onlyOnce } from "@utils/onlyOnce";
import { maybePromptToUpdate } from "@utils/updater";
import { Text } from "@webpack/common";
import type { ComponentType, PropsWithChildren } from "react";

export const handleSettingsTabError = onlyOnce(() => maybePromptToUpdate(
    "Uh Oh! Failed to render this Page." +
    " However, there is an update available that might fix it." +
    " Would you like to update and restart now?"
));

export function SettingsTab({ children }: PropsWithChildren) {
    return (
        <ErrorBoundary
            message="Failed to render this tab. If this issue persists, try reinstalling."
            onError={handleSettingsTabError}
        >
            <section className="vc-settings-tab">
                {children}
            </section>
        </ErrorBoundary>
    );
}

export function openSettingsTabModal(Tab: ComponentType<any>, Size?: ModalSize) {
    try {
        openModal((modalProps: ModalProps) => (
            <ModalRoot {...modalProps} size={Size || ModalSize.MEDIUM}>
                <ModalHeader>
                    <Text variant="text-lg/semibold" style={{ flexGrow: 1 }}>
                        {Tab.displayName?.replace("SettingsTab", "") || "Settings"}
                    </Text>
                    <ModalCloseButton onClick={modalProps.onClose} />
                </ModalHeader>

                <ModalContent className="vc-settings-modal">
                    <Tab />
                </ModalContent>
            </ModalRoot>
        ));
    } catch {
        handleSettingsTabError();
    }
}
