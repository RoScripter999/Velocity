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

import { Flex } from "@components/Flex";
import { Link } from "@components/Link";
import { settings } from "@plugins/decor/settings";
import { cl, DecorationModalClasses, requireAvatarDecorationModal } from "@plugins/decor/ui";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, type ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { Buttons, Forms, Text } from "@webpack/common";

import { openCreateDecorationModal } from "./CreateDecorationModal";

function GuidelinesModal(props: ModalProps) {
    return <ModalRoot
        {...props}
        size={ModalSize.SMALL}
        className={DecorationModalClasses.modal}
    >
        <ModalHeader separator={false} className={cl("modal-header")}>
            <Text
                color="text-default"
                variant="heading-lg/semibold"
                tag="h1"
                style={{ flexGrow: 1 }}
            >
                Hold on
            </Text>
            <ModalCloseButton onClick={props.onClose} />
        </ModalHeader>
        <ModalContent
            scrollbarType="none"
        >
            <Forms.FormText>
                By submitting a decoration, you agree to <Link
                    href="https://github.com/decor-discord/.github/blob/main/GUIDELINES.md"
                >
                    the guidelines
                </Link>. Not reading these guidelines may get your account suspended from creating more decorations in the future.
            </Forms.FormText>
        </ModalContent>
        <ModalFooter className={cl("modal-footer")}>
            <Flex style={{ gap: "4px" }}>
                <Buttons.Button
                    text="Continue"
                    onClick={() => {
                        settings.store.agreedToGuidelines = true;
                        props.onClose();
                        openCreateDecorationModal();
                    }}
                />
                <Buttons.Button
                    text="Go Back"
                    onClick={props.onClose}
                />
            </Flex>
        </ModalFooter>
    </ModalRoot>;
}

export const openGuidelinesModal = () =>
    requireAvatarDecorationModal().then(() => openModal(props => <GuidelinesModal {...props} />));
