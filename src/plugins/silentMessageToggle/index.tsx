/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 RoScripter999 and contributors
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

import { ChatBarButton, type ChatBarButtonFactory } from "@api/ChatButtons";
import { addMessagePreSendListener, type MessageSendListener, removeMessagePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { Icon } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin, { type IconComponent, OptionType } from "@utils/types";
import { Icons, useEffect, useState } from "@webpack/common";

let lastState = false;

const settings = definePluginSettings({
    persistState: {
        type: OptionType.BOOLEAN,
        description: "Whether to persist the state of the silent message toggle when changing channels",
        default: false,
        onChange(newValue: boolean) {
            if (newValue === false) lastState = false;
        }
    },
    autoDisable: {
        type: OptionType.BOOLEAN,
        description: "Automatically disable the silent message toggle again after sending one",
        default: true
    }
});

const SilentMessageIcon: IconComponent = ({ height = 20, width = 20, className, enabled }) => {
    const d = "M22.07 3.29 18.68 7h2.82c.28 0 .5.23.5.5v1a.5.5 0 0 1-.5.5h-5.33a.5.5 0 0 1-.5-.5v-1a1 1 0 0 1 .21-.63l1.1-1.38 1.99-2.5H16.5a.5.5 0 0 1-.5-.5V1.5c0-.28.22-.5.5-.5h5.33c.28 0 .5.22.5.5v1.11a1 1 0 0 1-.26.68ZM19 11.5a.5.5 0 0 0-.5-.5h-2.33a2.5 2.5 0 0 1-2.5-2.5v-1a3 3 0 0 1 .65-1.87l.48-.6c.18-.23.12-.57-.08-.78a2.5 2.5 0 0 1-.7-1.49.94.94 0 0 0-.07-.24 2 2 0 0 0-3.87-.07.62.62 0 0 1-.39.44A7 7 0 0 0 5 9.5v2.09a.5.5 0 0 1-.13.33l-1.1 1.22A3 3 0 0 0 3 15.15v.28c0 .67.34 1.29.95 1.56 1.31.6 4 1.51 8.05 1.51 4.05 0 6.74-.91 8.05-1.5.61-.28.95-.9.95-1.57v-.28a3 3 0 0 0-.77-2l-1.1-1.23a.5.5 0 0 1-.13-.33v-.09ZM9.18 19.84A.16.16 0 0 0 9 20a3 3 0 1 0 6 0c0-.1-.09-.17-.18-.16a24.84 24.84 0 0 1-5.64 0Z";
    if (enabled) {
        return (
            <Icon
                width={width}
                height={height}
                viewBox="0 0 24 24"
                className={className}
                style={{ scale: "1.2" }}
            >
                <defs>
                    <mask id="silent-msg-mask">
                        <rect width="24" height="24" fill="white" />
                        <path stroke="black" strokeWidth="5.99068" d="M0 24 24 0" />
                    </mask>
                </defs>
                <Icons.BellZIcon mask="url(#silent-msg-mask)" color="currentColor" />
                <path fill="var(--status-danger)" d="m21.178 1.70703 1.414 1.414L4.12103 21.593l-1.414-1.415L21.178 1.70703Z" />
            </Icon>
        );
    }

    return (
        <Icon
            width={width}
            height={height}
            viewBox="0 0 24 24"
            className={className}
            style={{ scale: "1.2" }}
        >
            <Icons.BellZIcon color="currentColor" />
        </Icon>
    );
};

const SilentMessageToggle: ChatBarButtonFactory = ({ isMainChat }) => {
    const [enabled, setEnabled] = useState(lastState);

    function setEnabledValue(value: boolean) {
        if (settings.store.persistState) lastState = value;
        setEnabled(value);
    }

    useEffect(() => {
        const listener: MessageSendListener = (_, message) => {
            if (enabled) {
                if (settings.store.autoDisable) setEnabledValue(false);
                if (!message.content.startsWith("@silent ")) message.content = "@silent " + message.content;
            }
        };

        addMessagePreSendListener(listener);
        return () => void removeMessagePreSendListener(listener);
    }, [enabled]);

    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip={enabled ? "Disable Silent Message" : "Enable Silent Message"}
            onClick={() => setEnabledValue(!enabled)}
        >
            <SilentMessageIcon enabled={enabled} />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "SilentMessageToggle",
    authors: [Devs.Nuckyz, Devs.CatNoir],
    description: "Adds a button to the chat bar to toggle sending a silent message.",
    tags: ["Chat", "Utility"],
    settings,

    chatBarButton: {
        icon: SilentMessageIcon,
        required: true,
        render: SilentMessageToggle
    }
});
