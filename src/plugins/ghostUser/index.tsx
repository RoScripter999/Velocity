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

import "./styles.css";

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import type { ButtonVariant, Channel } from "@velocity-types";
import { findComponentByCodeLazy } from "@webpack";
import { Alerts, Menu, showToast, Toasts, UserStore } from "@webpack/common";
import type { ComponentType, ReactNode } from "react";

import { openGhostModal } from "./ghostModal";

const ChatbarWithButton = findComponentByCodeLazy<ChatbarWithButtonProps>(".getState().isMembersOpen);");

type ChatbarWithButtonProps = {
    message: string;
    subtitle?: string;
    countdown?: number;
    buttonText: string;
    buttonVariant?: ButtonVariant;
    buttonIcon?: ComponentType<any>;
    buttonSubmitting?: boolean;
    onButtonClick: () => void;
    imageSrc?: string;
    animationSrc?: any;
    secondaryButtonText?: string;
    onSecondaryButtonClick?: () => void;
    children?: ReactNode;
    useReducedMotion?: boolean;
};

const settings = definePluginSettings({
    users: {
        type: OptionType.CUSTOM
    },
    image: {
        type: OptionType.STRING,
        description: "Custom image",
        placeholder: "Image url",
        default: "https://discord.com/assets/d4ce7b650a867313.svg"
    }
});

function unGhostUser(userId: string) {
    const users = settings.store.users ?? [];
    settings.store.users = users.filter((id: string) => id !== userId);
    const user = UserStore.getUser(userId);
    showToast(`${user.globalName || user.username} unghosted`, Toasts.Type.SUCCESS);
}

const ghostUserPatch: NavContextMenuPatchCallback = (children, { user }) => {
    const group = findGroupChildrenByChildId("ignore", children);
    if (!group) return;

    group.splice(group.findIndex(c => c?.props?.id === "ignore") + 1, 0, (
        <Menu.MenuItem
            id="ghost-user"
            label={settings.store.users?.includes(user.id) ? "Un-Ghost User" : "Ghost User"}
            action={() => {
                const users: string[] = settings.store.users ?? [];
                if (users.includes(user.id)) {
                    unGhostUser(user.id);
                } else {
                    openGhostModal(user.id, settings);
                }
            }}
        />
    ));
};

export default definePlugin({
    name: "GhostUser",
    authors: [Devs.RoScripter999],
    description: "Allows you to ghost users you don't like",
    tags: ["Appearance", "Privacy"],
    settings,

    contextMenus: {
        "user-context": ghostUserPatch
    },

    patches: [
        {
            find: "#{intl::DM_VERIFICATION_TEXT_BLOCKED}",
            replacement: {
                match: /return\(0,/,
                replace: "if($self.isBlocked(arguments[0].channel))return $self.blockedMessageBar(arguments[0].channel);$&"
            }
        },
        {
            find: "screensharePopoutOpen:!",
            replacement: {
                match: /screensharePopoutOpen:!\s*[^,}]+/,
                replace: "screensharePopoutOpen:!false"
            }
        },
        {
            find: ".onSpinnerStarted():null",
            replacement: {
                match: /paused:\s*(\i)=!1/,
                replace: "paused:$1=!0"
            }
        },
        {
            // in-call player patch #2 (disable "your stream is still running" text overlay)
            find: ["let{mainText", "errorCodeMessage:"],
            replacement: {
                match: /let{[^;]+/,
                replace: "return"
            }
        }
    ],


    isBlocked(channel: Channel) {
        if (!channel?.recipients) {
            return false;
        }

        const userId = channel.recipients[0];
        const users = settings.store.users ?? [];

        return users.includes(userId);
    },

    blockedMessageBar(channel: Channel) {
        return (
            <ChatbarWithButton
                buttonText="Un-Ghost"
                imageSrc={settings.store.image}
                message="You ghosted this person.."
                subtitle="You might hate this person!"
                onButtonClick={() => {
                    const userId = channel.recipients[0];
                    Alerts.show({
                        title: "Un-Ghost User",
                        body: "Are you sure you want to un-ghost this user?",
                        cancelText: "Cancel",
                        confirmText: "Un-Ghost",
                        onConfirm: () => unGhostUser(userId)
                    });
                }}
            />
        );
    }
});
