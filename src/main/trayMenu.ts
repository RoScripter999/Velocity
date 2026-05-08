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

import { IpcEvents } from "@shared/IpcEvents";
import { BrowserWindow, ipcMain, Menu, type MenuItemConstructorOptions, shell } from "electron";

import { SETTINGS_DIR, THEMES_DIR } from "./utils/constants";

let cachedUpdateAvailable = false;

ipcMain.on(IpcEvents.SET_TRAY_UPDATE_STATE, (_, available: boolean) => {
    cachedUpdateAvailable = available;
});

function sendToRenderer(event: IpcEvents): void {
    BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]?.webContents.send(event);
}

function findInsertIndex(template: MenuItemConstructorOptions[]): number {
    const openIndex = template.findIndex(item => {
        const label = item.label?.toLowerCase() ?? "";
        return label.includes("open") || label.includes("show");
    });
    return openIndex !== -1 ? openIndex + 1 : 0;
}

function isTrayMenu(template: MenuItemConstructorOptions[]): boolean {
    if (!template.length) return false;

    const hasOpenOrShow = template.some(item => {
        const label = item.label?.toLowerCase() ?? "";
        return label.includes("open") || label.includes("show");
    });

    const hasQuit = template.some(item =>
        item.label?.toLowerCase().includes("quit") || item.role === "quit"
    );

    const isNotAppMenu = !template.some(item =>
        item.label === "&File" || item.label === "File" ||
        item.label === "&Edit" || item.label === "Edit"
    );

    return hasOpenOrShow && hasQuit && isNotAppMenu;
}

function createVelocityMenuItems(): MenuItemConstructorOptions[] {
    return [
        {
            label: "Velocity",
            submenu: [
                {
                    label: cachedUpdateAvailable ? "Update Velocity" : "Check for Updates",
                    click: () => sendToRenderer(IpcEvents.TRAY_CHECK_UPDATES)
                },
                {
                    label: "Repair Velocity",
                    click: () => sendToRenderer(IpcEvents.TRAY_REPAIR)
                },
                { type: "separator" },
                {
                    label: "Join Support Server",
                    click: () => sendToRenderer(IpcEvents.TRAY_JOIN_SUPPORT_SERVER)
                },
                {
                    label: "Open Settings Folder",
                    click: () => shell.openPath(SETTINGS_DIR)
                },
                {
                    label: "Open Themes Folder",
                    click: () => shell.openPath(THEMES_DIR)
                }
            ]
        }
    ];
}

export function patchTrayMenu(): void {
    const originalBuildFromTemplate = Menu.buildFromTemplate;

    Menu.buildFromTemplate = function (template: MenuItemConstructorOptions[]) {
        const alreadyPatched = template.some(item => item.label === "Velocity");
        if (isTrayMenu(template) && !alreadyPatched) {
            const insertIndex = findInsertIndex(template);
            const VelocityItems = createVelocityMenuItems();
            template.splice(insertIndex, 0, ...VelocityItems);
        }

        return originalBuildFromTemplate.call(this, template);
    };
}
