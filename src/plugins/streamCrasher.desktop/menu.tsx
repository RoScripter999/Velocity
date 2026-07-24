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

import type { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { settings } from "@plugins/streamCrasher.desktop";
import { BuildPluginSettings } from "@plugins/velocityToolbox/menu";
import { Menu } from "@webpack/common";

export function CrasherContextMenu({ closePopout }) {
    const { isEnabled, keybindEnabled, crashMode } = settings.use(["isEnabled", "keybindEnabled", "crashMode", "imageUrl"]);

    return (
        <Menu.Menu navId="stream-crasher-context" onClose={closePopout}>
            {BuildPluginSettings(settings, true, [-3], ["buttonLocation"])}

        </Menu.Menu>
    );
}

export const StreamCrasherPatch: NavContextMenuPatchCallback = children => {
    const { isEnabled } = settings.use(["isEnabled"]);

    children.splice(3, 0,
        <Menu.MenuCheckboxItem
            id="stream-crasher-toggle"
            label={isEnabled ? "Disable Crasher" : "Enable Crasher"}
            checked={isEnabled}
            action={() => settings.store.isEnabled = !settings.store.isEnabled}
        />
    );
};
