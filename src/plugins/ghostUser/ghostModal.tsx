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
import { Paragraph } from "@components/Paragraph";
import { classNameFactory } from "@utils/css";
import { getIntlMessage } from "@utils/discord";
import { ModalContent, ModalFooter, ModalHeader, type ModalProps, ModalRoot, ModalSize, openModalLazy } from "@utils/modal";
import { wordsToTitle } from "@utils/text";
import { DefinedSettings } from "@utils/types";
import { Avatar, Buttons, ChannelActionCreators, ChannelStore, Clickable, Icons, showToast, Text, Toasts, UserStore } from "@webpack/common";
import type { ReactNode } from "react";

interface GhostModalProps {
    userId: string;
    settings: DefinedSettings;
    ModalProps: ModalProps;
}

const cl = classNameFactory("vc-gu-");

interface DetailSectionProps {
    title: string;
    description: string;
    icon?: ReactNode;
}

function DetailSection({ title, description, icon }: DetailSectionProps) {
    return (
        <div className={cl("detail-section")}>
            <div className={cl("section-row")}>
                {icon}
                <Flex flexDirection="column" gap="2px">
                    <Text variant="text-md/semibold">{title}</Text>
                    <Paragraph color="text-subtle">{description}</Paragraph>
                </Flex>
            </div>
        </div>
    );
}

function GhostModal({ userId, settings, ModalProps }: GhostModalProps) {
    const user = UserStore.getUser(userId);

    function ghostUser() {
        const users = settings.store.users ?? [];
        const index = users.indexOf(userId);

        if (index > -1) {
            users.splice(index, 1);
        } else {
            users.push(userId);
        }

        settings.store.users = users;
        ModalProps.onClose?.();
        showToast(`${user.globalName || user.username} ghosted`, Toasts.Type.SUCCESS);
    }

    function closeDm() {
        ChannelActionCreators.closePrivateChannel(ChannelStore.getDMFromUserId(user.id));
        ModalProps.onClose?.();
    }

    return (
        <ModalRoot {...ModalProps} size={ModalSize.SMALL}>
            <ModalHeader className={cl("header")}>
                <Avatar className={cl("avatar-container")} size="SIZE_80" src={user.getAvatarURL()} />
                <div>
                    <Text color="text-strong" tag="h3" variant="heading-xl/bold">{wordsToTitle(["Ghost", user.globalName || user.username, "?"])}</Text>
                    <Paragraph size="md" color="text-subtle">Ignore this user in a rude way</Paragraph>
                </div>
            </ModalHeader>
            <ModalContent>
                <DetailSection
                    title="Have space"
                    description="Live a life without this user in the way"
                    icon={<Icons.CircleCheckIcon color="var(--icon-muted)" size="lg" />}
                />
                <DetailSection
                    title="Have their notifications and activity"
                    description="Everything is the same"
                    icon={<Icons.CircleCheckIcon color="var(--icon-muted)" size="lg" />}
                />
                <DetailSection
                    title="Cannot Chat"
                    description="You won't be able to speak or chat with them"
                    icon={<Icons.TopicsIcon color="var(--icon-muted)" size="lg" />}
                />
                <Flex justifyContent="center">
                    <Clickable onClick={closeDm}>
                        <Text className={cl("suggestion-text")}>Close DM Instead</Text>
                    </Clickable>
                </Flex>
            </ModalContent>
            <ModalFooter className={cl("footer")}>
                <Buttons.Button text="Ghost" type="submit" onClick={ghostUser} />
                <Buttons.Button variant="secondary" text={getIntlMessage("CANCEL")} onClick={ModalProps.onClose} />
            </ModalFooter>
        </ModalRoot >
    );
}

export function openGhostModal(userId: string, settings: DefinedSettings) {
    openModalLazy(async () => {
        return props => <GhostModal userId={userId} settings={settings} ModalProps={props} />;
    });
}
