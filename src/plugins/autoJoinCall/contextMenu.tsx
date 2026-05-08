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

import type { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import AutoJoinCallPlugin from "@plugins/autoJoinCall";
import { Icons, Menu } from "@webpack/common";

export const streamContextMenuPatch: NavContextMenuPatchCallback = children => {
    children.splice(4, 0,
        <Menu.MenuItem
            id="vc-autojoin-settings"
            label="Auto Join Settings"
            icon={Icons.SettingsIcon}
            action={() => openPluginModal(AutoJoinCallPlugin)}
        />
    );
};

export function streamEnablingPatch(): NavContextMenuPatchCallback {
    return children => {
        const { autoStream } = AutoJoinCallPlugin.settings.use(["autoStream"]);

        children.splice(2, 0,
            <Menu.MenuSeparator />,
            <Menu.MenuCheckboxItem
                id="vc-stream-checkbox"
                label="Auto Stream"
                checked={autoStream ?? false}
                action={() => {
                    AutoJoinCallPlugin.settings.store.autoStream = !AutoJoinCallPlugin.settings.store.autoStream;
                }}
            />
        );
    };
}
