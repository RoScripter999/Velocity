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

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import type { Guild } from "@velocity-types";
import { Icons, Menu } from "@webpack/common";

import { openGuildInfoModal } from "./GuildInfoModal";

const makePatch = (showIcon: boolean): NavContextMenuPatchCallback => (children, { guild }: { guild: Guild; }) => {
    const group = findGroupChildrenByChildId("privacy", children);

    group?.push(
        <Menu.MenuItem
            id="vc-server-info"
            label="Server Info"
            leadingAccessory={showIcon ? { type: "icon", icon: Icons.CircleInformationIcon } : undefined}
            icon={showIcon ? Icons.CircleInformationIcon : undefined}
            action={() => openGuildInfoModal(guild)}
        />
    );
};

export default definePlugin({
    name: "ServerInfo",
    description: "Allows you to view info about a server",
    tags: ["Servers", "Utility"],
    authors: [Devs.Ven, Devs.Nuckyz],
    dependencies: ["DynamicImageModalAPI"],
    searchTerms: ["guild", "info", "ServerProfile"],

    contextMenus: {
        "guild-context": {
            render: makePatch(false),
            required: true
        },
        "guild-header-popout": {
            render: makePatch(true),
            required: false
        }
    }
});
