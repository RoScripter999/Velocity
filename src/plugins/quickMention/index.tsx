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

import { Devs } from "@utils/constants";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin from "@utils/types";
import { ChannelStore, Icons, PermissionsBits, PermissionStore } from "@webpack/common";

export default definePlugin({
    name: "QuickMention",
    authors: [Devs.kemo],
    description: "Adds a quick mention button to the message actions bar",
    tags: ["Chat", "Shortcuts"],

    messagePopoverButton: {
        icon: () => <Icons.AtIcon color="currentColor" />,
        render(msg) {
            const channel = ChannelStore.getChannel(msg.channel_id);
            if (channel.guild_id && !PermissionStore.can(PermissionsBits.SEND_MESSAGES, channel)) return null;

            return {
                label: "Quick Mention",
                icon: Icons.AtIcon,
                message: msg,
                channel,
                onClick: () => insertTextIntoChatInputBox(`<@${msg.author.id}> `)
            };
        }
    }
});
