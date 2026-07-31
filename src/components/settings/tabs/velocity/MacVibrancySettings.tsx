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

import { useSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Select } from "@webpack/common";

export function MacOSVibrancySettings() {
    const settings = useSettings(["macosVibrancyStyle"]);

    return (
        <ErrorBoundary noop>
            <Select
                label="MacOS Window vibrancy style (requires restart)"
                placeholder="Window vibrancy style"
                options={[
                    // Sorted from most opaque to most transparent
                    {
                        label: "No vibrancy", value: undefined
                    },
                    {
                        label: "Under Page (window tinting)",
                        value: "under-page"
                    },
                    {
                        label: "Content",
                        value: "content"
                    },
                    {
                        label: "Window",
                        value: "window"
                    },
                    {
                        label: "Selection",
                        value: "selection"
                    },
                    {
                        label: "Titlebar",
                        value: "titlebar"
                    },
                    {
                        label: "Header",
                        value: "header"
                    },
                    {
                        label: "Sidebar",
                        value: "sidebar"
                    },
                    {
                        label: "Tooltip",
                        value: "tooltip"
                    },
                    {
                        label: "Menu",
                        value: "menu"
                    },
                    {
                        label: "Popover",
                        value: "popover"
                    },
                    {
                        label: "Fullscreen UI (transparent but slightly muted)",
                        value: "fullscreen-ui"
                    },
                    {
                        label: "HUD (Most transparent)",
                        value: "hud"
                    }
                ]}
                onSelectionChange={v => settings.macosVibrancyStyle = v}
                value={settings.macosVibrancyStyle}
                fullWidth
                formatOption={option => ({
                    ...option,
                    id: option.value
                })}
            />
        </ErrorBoundary>
    );
}
