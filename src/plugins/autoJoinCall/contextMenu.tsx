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
import { openPluginModal } from "@components/settings";
import { Icons, Menu } from "@webpack/common";

import AutoJoinCallPlugin, { settings } from ".";

export const StreamSettingsContextMenuPatch: NavContextMenuPatchCallback = children => {
    const group = findGroupChildrenByChildId("voice-and-video-settings", children) ?? children;
    const idx = group?.findIndex(i => i?.props?.id === "voice-and-video-settings");

    group.splice(idx - 1, 0,
        <Menu.MenuItem
            id="vc-autojoin-settings"
            label="Auto Join Settings"
            icon={Icons.SettingsIcon}
            leadingAccessory={{ type: "icon", icon: Icons.SettingsIcon }}
            action={() => openPluginModal(AutoJoinCallPlugin)}
        />
    );
};

export const AutoStreamPatch: NavContextMenuPatchCallback = children => {
    const { autoStream } = settings.use(["autoStream"]);

    children.splice(2, 0,
        <Menu.MenuSeparator />,
        <Menu.MenuCheckboxItem
            id="vc-stream-checkbox"
            label="Auto Stream"
            checked={autoStream ?? false}
            action={() => settings.store.autoStream = !settings.store.autoStream}
        />
    );
};
