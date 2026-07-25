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
import definePlugin, { type IconComponent, OptionType } from "@utils/types";
import { FluxDispatcher, Icons, Menu } from "@webpack/common";

const settings = definePluginSettings({
    isEnabled: {
        type: OptionType.BOOLEAN,
        description: "Toggle functionality",
        default: true
    }
});

const SilentTypingIcon: IconComponent = ({ height = 20, width = 20, className, enabled }) => {
    if (enabled) {
        return (
            <Icon
                width={width}
                height={height}
                className={className}
                viewBox="0 0 24 24"
            >
                <defs>
                    <mask id="silent-typing-msg-mask">
                        <path fill="#fff" d="M0 0h24v24H0Z"></path>
                        <path stroke="#000" strokeWidth="5.99068" d="M0 24 24 0"></path>
                    </mask>
                </defs>
                <Icons.KeyboardIcon color="currentColor" mask="url(#silent-typing-msg-mask)" />
                <path fill="var(--status-danger)" d="m21.178 1.70703 1.414 1.414L4.12103 21.593l-1.414-1.415L21.178 1.70703Z" />
            </Icon>
        );
    }

    return (
        <Icon
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 24"
        >
            <Icons.KeyboardIcon color="currentColor" />
        </Icon>
    );
};

const SilentTypingToggle: ChatBarButtonFactory = ({ isMainChat }) => {
    const { isEnabled } = settings.use(["isEnabled"]);

    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip={isEnabled ? "Disable Silent Typing" : "Enable Silent Typing"}
            onClick={() => settings.store.isEnabled = !settings.store.isEnabled}
        >
            <SilentTypingIcon enabled={isEnabled} />
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
            id="vc-silent-typing"
            label="Enable Silent Typing"
            checked={isEnabled}
            action={() => settings.store.isEnabled = !settings.store.isEnabled}
        />
    );
};


export default definePlugin({
    name: "SilentTyping",
    authors: [Devs.Ven, Devs.Rini, Devs.ImBanana],
    description: "Hide that you are typing",
    tags: ["Chat", "Privacy"],
    settings,

    contextMenus: {
        "textarea-context": { render: ChatBarContextCheckbox, required: true }
    },

    patches: [
        {
            find: '.dispatch({type:"TYPING_START_LOCAL"',
            replacement: {
                match: /startTyping\(\i\){.+?},stop/,
                replace: "startTyping:$self.startTyping,stop"
            }
        }
    ],

    commands: [{
        name: "silenttype",
        description: "Toggle whether you're hiding that you're typing or not.",
        inputType: ApplicationCommandInputType.BUILT_IN,
        options: [
            {
                name: "value",
                description: "Whether to hide or not that you're typing (default is toggle)",
                required: false,
                type: ApplicationCommandOptionType.BOOLEAN
            }
        ],
        execute: async interaction => {
            settings.store.isEnabled = !!interaction.options.getBoolean("value", true);
            interaction.reply({
                content: settings.store.isEnabled ? "Silent typing enabled!" : "Silent typing disabled!"
            });
        }
    }],

    async startTyping(channelId: string) {
        if (settings.store.isEnabled) return;
        FluxDispatcher.dispatch({ type: "TYPING_START_LOCAL", channelId });
    },

    chatBarButton: {
        icon: () => SilentTypingIcon,
        render: SilentTypingToggle
    }
});
