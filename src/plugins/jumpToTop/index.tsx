/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 RoScripter999 and contributors
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

import { ChannelToolbarButton } from "@api/HeaderBar";
import { Devs } from "@utils/constants";
import { getCurrentChannel, getIntlMessage } from "@utils/discord";
import definePlugin from "@utils/types";
import { Icons, MessageActions } from "@webpack/common";

function jumpToTop(channelId: string) {
    MessageActions.jumpToMessage({
        channelId,
        messageId: channelId,
        flash: false,
        jumpType: "INSTANT"
    });
}

export default definePlugin({
    name: "JumpToTop",
    description: "Adds a button to jump to the first message in a channel",
    authors: [Devs.RoScripter999],
    tags: ["Chat", "Utility"],

    headerBarButton: {
        location: "channeltoolbar",
        icon: () => Icons.ArrowSmallUpIcon,
        render: () => {
            const channel = getCurrentChannel();
            if (!channel) return null;

            return (
                <ChannelToolbarButton
                    icon={Icons.ArrowSmallUpIcon}
                    tooltip={getIntlMessage("JUMP_TO_TOP")}
                    onClick={() => jumpToTop(channel.id)}
                />
            );
        }
    }
});
