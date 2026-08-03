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

import { showNotice } from "@api/Notices";
import { hasAnyVisibleSettings, isPluginEnabled, pluginRequiresRestart, plugins, startDependenciesRecursive, startPlugin, stopPlugin } from "@api/PluginManager";
import { Settings } from "@api/Settings";
import { AddonCard } from "@components/settings/AddonCard";
import { Span } from "@components/Span";
import type { Plugin } from "@utils/types";
import { Icons, showToast, Toasts } from "@webpack/common";
import type { HTMLProps } from "react";

import { cl, logger } from ".";
import { openPluginModal } from "./PluginModal";
import { hasUIElements, openUIElementsModal } from "./UIElements";

interface PluginCardProps extends HTMLProps<HTMLDivElement> {
    plugin: Plugin;
    disabled: boolean;
    onRestartNeeded(name: string, key: string): void;
    isNew?: boolean;
}

export function PluginCard({ plugin, disabled, onRestartNeeded, onMouseEnter, onMouseLeave, isNew }: PluginCardProps) {
    const settings = Settings.plugins[plugin.name];

    // Since the changelog also renders the plugin card it might
    // have the chance that it's already been removed, causing the info button to crash.
    const isRemoved = !plugins[plugin.name];

    const isEnabled = () => isRemoved ? false : isPluginEnabled(plugin.name);

    function toggleEnabled() {
        if (isRemoved) return;
        const wasEnabled = isEnabled();

        if (!wasEnabled) {
            const { restartNeeded, failures } = startDependenciesRecursive(plugin);

            if (failures.length) {
                logger.error(`Failed to start dependencies for ${plugin.name}: ${failures.join(", ")}`);
                showNotice("Failed to start dependencies: " + failures.join(", "), "Close", () => null);
                return;
            }

            if (restartNeeded) {
                settings.enabled = true;
                onRestartNeeded(plugin.name, "enabled");
                return;
            }
        }

        if (pluginRequiresRestart(plugin)) {
            settings.enabled = !wasEnabled;
            onRestartNeeded(plugin.name, "enabled");
            return;
        }

        if (wasEnabled && !plugin.started) {
            settings.enabled = !wasEnabled;
            return;
        }

        const result = wasEnabled ? stopPlugin(plugin) : startPlugin(plugin);

        if (!result) {
            settings.enabled = false;
            showToast(`Error while ${wasEnabled ? "stopping" : "starting"} plugin ${plugin.name}`, Toasts.Type.FAILURE, {
                position: Toasts.Position.BOTTOM
            });
            return;
        }

        settings.enabled = !wasEnabled;
    }

    const hasSettings = hasAnyVisibleSettings(plugin);
    const hasUi = !hasSettings && hasUIElements(plugin.name);

    return (
        <AddonCard
            name={plugin.name}
            description={<Span>{plugin.description}</Span>}
            isNew={isNew}
            enabled={isEnabled()}
            setEnabled={toggleEnabled}
            disabled={disabled || isRemoved}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            infoButtonTooltip={isRemoved ? undefined : (hasSettings ? "Open settings" : hasUi ? "Manage UI Elements" : "Plugin info")}
            enabledTooltip="Disable plugin"
            disabledTooltip="Enable plugin"
            infoButton={isRemoved ? null : (
                <button
                    role="switch"
                    aria-checked="false"
                    onClick={() => hasUi ? openUIElementsModal(plugin) : openPluginModal(plugin, onRestartNeeded)}
                    className={cl("info-button")}
                >
                    {hasSettings || hasUi
                        ? <Icons.SettingsIcon color="currentColor" className={cl("settings-button")} />
                        : <Icons.CircleInformationIcon color="currentColor" className={cl("info-icon")} />}
                </button>
            )}
        />
    );
}
