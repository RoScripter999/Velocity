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

import { ChatBarButton, type ChatBarButtonFactory } from "@api/ChatButtons";
import { addMessagePreSendListener, type MessageSendListener, removeMessagePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { Icon } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin, { type IconComponent, OptionType } from "@utils/types";
import { useEffect } from "@webpack/common";

const settings = definePluginSettings({
    isEnabled: {
        type: OptionType.BOOLEAN,
        description: "Reverse message state",
        default: false
    }
});

const ReverseMessageIcon: IconComponent = ({ height = 20, width = 20, enabled }) => {
    return (
        <Icon width={width} height={height} viewBox="0 0 24 24">
            <path
                fill={enabled ? "var(--green-360)" : "currentColor"}
                d="M12.05 20q-3.35 0-5.7-2.325t-2.35-5.675v-0.175l-0.9 0.9q-0.275 0.275-0.7 0.275t-0.7-0.275q-0.275-0.275-0.275-0.7t0.275-0.7l2.6-2.6q0.3-0.3 0.7-0.3t0.7 0.3l2.6 2.6q0.275 0.275 0.275 0.7t-0.275 0.7q-0.275 0.275-0.7 0.275t-0.7-0.275l-0.9-0.9v0.175q0 2.5 1.7625 4.25T12.05 18q0.4 0 0.7875-0.05t0.7625-0.175q0.425-0.125 0.8 0.025t0.575 0.525q0.2 0.4 0.0375 0.7875T14.425 19.625q-0.575 0.2-1.175 0.2875t-1.2 0.0875Zm-0.1-14q-0.4 0-0.7875 0.05t-0.7625 0.175q-0.425 0.125-0.8125-0.025T9 5.675q-0.2-0.375-0.0375-0.7625T9.525 4.4q0.6-0.2 1.2-0.3t1.225-0.1q3.35 0 5.7 2.325t2.35 5.675v0.175l0.9-0.9q0.275-0.275 0.7-0.275t0.7 0.275q0.275 0.275 0.275 0.7t-0.275 0.7L19.7 15.275q-0.3 0.3-0.7 0.3t-0.7-0.3L15.7 12.675q-0.275-0.275-0.275-0.7t0.275-0.7q0.275-0.275 0.7-0.275t0.7 0.275l0.9 0.9v-0.175q0-2.5-1.7625-4.25T11.95 6Z"
            />
        </Icon>
    );
};

const ReverseMessageButton: ChatBarButtonFactory = ({ isMainChat }) => {
    const { isEnabled } = settings.use(["isEnabled"]);

    useEffect(() => {
        const listener: MessageSendListener = (_, message) => {
            if (isEnabled && message.content) {
                message.content = message.content.split("").reverse().join("");
            }
        };

        addMessagePreSendListener(listener);
        return () => void removeMessagePreSendListener(listener);
    }, [isEnabled]);

    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip={isEnabled ? "Disable Reverse Message" : "Enable Reverse Message"}
            onClick={() => settings.store.isEnabled = !settings.store.isEnabled}
        >
            <ReverseMessageIcon enabled={isEnabled} />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "TalkInReverse",
    description: "Reverses the message content before sending it.",
    tags: ["Chat", "Fun", "Friends"],
    authors: [Devs.RoScripter999],
    settings,

    chatBarButton: {
        icon: ReverseMessageIcon,
        render: ReverseMessageButton
    }
});
