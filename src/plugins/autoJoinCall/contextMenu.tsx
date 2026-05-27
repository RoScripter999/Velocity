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

import AutoJoinCallPlugin, { settings, statusOptions } from ".";

export function AutoJoinMenu({ closePopout }: { closePopout(): void; }) {
    const { autoJoinEnabled, voiceSetting, status, autoStream, streamSound } = settings.use(["autoJoinEnabled", "voiceSetting", "status", "autoStream", "streamSound"]);

    return (
        <Menu.Menu navId="manage-autojoin" onClose={closePopout}>
            <Menu.MenuCheckboxItem
                id="autojoin-enabled"
                label="Enable Auto Join"
                checked={autoJoinEnabled}
                action={() => settings.store.autoJoinEnabled = !settings.store.autoJoinEnabled}
            />
            <Menu.MenuSeparator />
            <Menu.MenuItem id="autojoin-voice" label="Voice on Join">
                <Menu.MenuRadioItem
                    id="voice-none"
                    group="autojoin-voice"
                    label="None"
                    checked={voiceSetting === "none"}
                    action={() => settings.store.voiceSetting = "none"}
                />
                <Menu.MenuRadioItem
                    id="voice-mute"
                    group="autojoin-voice"
                    label="Auto Mute"
                    checked={voiceSetting === "mute"}
                    action={() => settings.store.voiceSetting = "mute"}
                />
                <Menu.MenuRadioItem
                    id="voice-deafen"
                    group="autojoin-voice"
                    label="Auto Deafen"
                    checked={voiceSetting === "deafen"}
                    action={() => settings.store.voiceSetting = "deafen"}
                />
            </Menu.MenuItem>
            <Menu.MenuItem id="autojoin-status" label="Join On Status">
                {statusOptions.map(({ label, value }) => (
                    <Menu.MenuCheckboxItem
                        key={value}
                        id={`status-${value}`}
                        label={label}
                        checked={status.includes(value)}
                        action={() => {
                            settings.store.status = status.includes(value)
                                ? status.filter(x => x !== value)
                                : [...status, value];
                        }}
                    />
                ))}
            </Menu.MenuItem>
            {!IS_WEB && <>
                <Menu.MenuSeparator />
                <Menu.MenuCheckboxItem
                    id="autojoin-autostream"
                    label="Auto Stream on Join"
                    checked={autoStream ?? false}
                    action={() => settings.store.autoStream = !settings.store.autoStream}
                />
                <Menu.MenuCheckboxItem
                    id="autojoin-streamsound"
                    label="Stream with Sound"
                    checked={streamSound ?? true}
                    action={() => settings.store.streamSound = !settings.store.streamSound}
                />
            </>}
        </Menu.Menu>
    );
}

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
