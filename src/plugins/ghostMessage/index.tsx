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

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { MessageActions, UserStore } from "@webpack/common";

const settings = definePluginSettings({
    prefix: {
        type: OptionType.STRING,
        description: "Prefix to trigger ghost message deletion",
        default: "!",
        componentProps: { maxLength: 1, helperText: "DO NOT use a generic character" }
    },
    ignoreChannels: {
        type: OptionType.STRING,
        multiline: true,
        default: "",
        description: "Comma seperated channel IDs to ignore"
    },
    ignoreServers: {
        type: OptionType.BOOLEAN,
        description: "Whether it shouldn't ghost message in guilds",
        default: false
    }
});

export default definePlugin({
    name: "GhostMessage",
    description: "Deletes your messages that start with a specific prefix",
    tags: ["Fun", "Friends", "Chat"],
    authors: [Devs.RoScripter999],

    settings,

    flux: {
        async MESSAGE_CREATE(event: { message: Message, channelId: string, guildId: string | undefined; }) {
            const { message, channelId, guildId } = event;
            const me = UserStore.getCurrentUser();

            if (!message.content.startsWith(settings.store.prefix)) return;
            if (message.author.id !== me?.id) return;
            if (guildId && settings.store.ignoreServers) return;

            if (settings.store.ignoreChannels.split(",").includes(channelId)) return;

            try {
                if (!message.deleted && message.content !== null) {
                    await MessageActions.deleteMessage(channelId, message.id);
                }
            } catch (e) {
                new Logger("GhostMessage").error("Failed to delete message", e);
            }
        }
    }
});
