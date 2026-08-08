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
import { ApplicationCommandInputType, ApplicationCommandOptionType } from "@api/Commands";
import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { Icon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import definePlugin, { IconComponent, makeRange, OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { ChannelType } from "@velocity-types/enums";
import { ChannelStore, Menu, UserStore } from "@webpack/common";

const settings = definePluginSettings({
    isEnabled: {
        type: OptionType.BOOLEAN,
        description: "Toggle functionality",
        default: false
    },
    cooldown: {
        type: OptionType.SLIDER,
        description: "Cooldown between repeats (seconds)",
        default: 0,
        markers: makeRange(0, 60, 10),
        stickToMarkers: false
    },
    delayBeforeSend: {
        type: OptionType.SLIDER,
        description: "Delay before sending the repeated message (seconds)",
        default: 0,
        markers: [0, 1, 2, 3, 5, 10],
        stickToMarkers: false
    }
});

let lastRepeatTime = 0;

const RepeatAfterMeIcon: IconComponent = ({ enabled, ...rest }) => {
    if (enabled) {
        return (
            <Icon
                {...rest}
                style={{ scale: "1.2" }}
            >
                <defs>
                    <mask id="repeat-after-me-mask">
                        <rect width="24" height="24" fill="white" />
                        <path stroke="black" strokeWidth="5.99068" d="M0 24 24 0" />
                    </mask>
                </defs>
                <path fill="currentColor" mask="url(#repeat-after-me-mask)" d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" />
                <path fill="var(--status-danger)" d="m21.178 1.70703 1.414 1.414L4.12103 21.593l-1.414-1.415L21.178 1.70703Z" />
            </Icon>
        );
    }

    return (
        <Icon
            {...rest}
            style={{ scale: "1.2" }}
        >
            <path fill="currentColor" d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" />
        </Icon>
    );
};

const RepeatAfterMeToggle: ChatBarButtonFactory = ({ isMainChat }) => {
    const { isEnabled } = settings.use(["isEnabled"]);

    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip={isEnabled ? "Disable RepeatAfterMe" : "Enable RepeatAfterMe"}
            onClick={() => settings.store.isEnabled = !settings.store.isEnabled}
        >
            <RepeatAfterMeIcon enabled={isEnabled} />
        </ChatBarButton>
    );
};

const ChatBarContextCheckbox: NavContextMenuPatchCallback = children => {
    const { isEnabled } = settings.use(["isEnabled"]);

    const group = findGroupChildrenByChildId("submit-button", children);
    if (!group) return;

    const idx = group.findIndex(c => c?.props?.id === "submit-button");

    group.splice(idx + 1, 0,
        <Menu.MenuCheckboxItem
            id="vc-repeat-after-me"
            label="Enable Repeat After Me"
            checked={isEnabled}
            action={() => settings.store.isEnabled = !settings.store.isEnabled}
        />
    );
};

export default definePlugin({
    name: "RepeatAfterMe",
    description: "Repeats whatever someone says in DMs",
    tags: ["Fun", "Chat"],
    authors: [Devs.RoScripter999],
    settings,

    contextMenus: {
        "textarea-context": {
            render: ChatBarContextCheckbox,
            required: true
        }
    },

    commands: [{
        name: "repeatafterme",
        description: "Toggle RepeatAfterMe",
        inputType: ApplicationCommandInputType.BUILT_IN,
        options: [{
            name: "value",
            description: "whether to enable or disable the RepeatAfterMe state",
            required: true,
            type: ApplicationCommandOptionType.BOOLEAN
        }],
        execute: async interaction => {
            settings.store.isEnabled = !!interaction.options.getBoolean("value", true);
            void interaction.reply({
                content: settings.store.isEnabled ? "RepeatAfterMe enabled!" : "RepeatAfterMe disabled!"
            });
        }
    }],

    flux: {
        MESSAGE_CREATE(event: { message: Message, channelId: string; }) {
            if (!settings.store.isEnabled) return;

            const { message } = event;
            const channel = ChannelStore.getChannel(event.channelId);

            if (channel.type === ChannelType.DM && message.author.id !== UserStore.getCurrentUser()?.id && !message.author.bot) {
                const now = Date.now();
                const cooldownMs = settings.store.cooldown * 1000;
                const delayMs = settings.store.delayBeforeSend * 1000;

                if (now - lastRepeatTime < cooldownMs) return;

                const { content } = message;
                if (content) {
                    setTimeout(() => {
                        sendMessage(message.channel_id, { content });
                    }, delayMs);

                    lastRepeatTime = now;
                }
            }
        }
    },

    chatBarButton: {
        icon: () => RepeatAfterMeIcon,
        render: RepeatAfterMeToggle
    }
});
