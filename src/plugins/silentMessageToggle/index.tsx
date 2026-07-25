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
    if (enabled) {
        return (
            <Icon
                width={width}
                height={height}
                viewBox="0 0 24 24"
                className={className}
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
        icon: () => SilentMessageIcon,
        required: true,
        render: SilentMessageToggle
    }
});
