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
import { openPluginModal } from "@components/settings";
import StreamCrasherPlugin, { crashModeLabels, settings } from "@plugins/streamCrasher.desktop";
import { Icons, Menu } from "@webpack/common";

export function CrasherContextMenu({ closePopout, settings }) {
    const { isEnabled, keybindEnabled, crashMode } = settings.use(["isEnabled", "keybindEnabled", "crashMode"]);

    return (
        <Menu.Menu navId="stream-crasher-context" onClose={closePopout}>
            <Menu.MenuCheckboxItem
                id="context-toggle"
                label={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                checked={isEnabled}
                action={() => settings.store.isEnabled = !settings.store.isEnabled}
            />
            <Menu.MenuCheckboxItem
                id="keybind-toggle"
                label={keybindEnabled ? "Disable Keybind" : "Enable Keybind"}
                checked={keybindEnabled}
                action={() => settings.store.keybindEnabled = !settings.store.keybindEnabled}
            />
            <Menu.MenuSeparator />
            <Menu.MenuItem id="crash-mode" label="Crash Mode">
                {Object.entries(crashModeLabels).map(([value, { value: label, subText }]) => (
                    <Menu.MenuCheckboxItem
                        key={value}
                        id={value}
                        label={label}
                        subtext={subText}
                        checked={crashMode === value}
                        action={() => settings.store.crashMode = value}
                    />
                ))}
            </Menu.MenuItem>
            <Menu.MenuSeparator />
            <Menu.MenuItem
                id="settings"
                label="Crasher Settings"
                icon={Icons.SettingsIcon}
                leadingAccessory={{ type: "icon", icon: Icons.SettingsIcon }}
                action={() => openPluginModal(StreamCrasherPlugin)}
            />
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
