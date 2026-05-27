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

import { RendererSettings } from "@main/settings";
import { BrowserWindow, desktopCapturer, type IpcMainInvokeEvent } from "electron";
import blackHtml from "file://./modes/black.html?minify";
import colorsHtml from "file://./modes/colors.html?minify";
import flashingHtml from "file://./modes/flashing.html?minify";
import whiteHtml from "file://./modes/white.html?minify";

let crashedWindow: BrowserWindow | null = null;
let cachedSourceId: string | null = null;
let activeMode: string | null = null;

const Modes: Record<string, string> = {
    black: `data:text/html,${encodeURIComponent(blackHtml)}`,
    flashing: `data:text/html,${encodeURIComponent(flashingHtml)}`,
    white: `data:text/html,${encodeURIComponent(whiteHtml)}`,
    colors: `data:text/html,${encodeURIComponent(colorsHtml)}`
};

function getMode(): string {
    return RendererSettings.store.plugins?.StreamCrasher?.crashMode;
}

export async function createCrashSource(_e: IpcMainInvokeEvent): Promise<string | null> {
    const mode = getMode();
    const html = Modes[mode] ?? Modes.black;

    if (crashedWindow && !crashedWindow.isDestroyed()) {
        if (activeMode !== mode) {
            activeMode = mode;
            crashedWindow.loadURL(html);
        }
        crashedWindow.showInactive();
        return cachedSourceId;
    }

    activeMode = mode;
    crashedWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: false,
        frame: false,
        skipTaskbar: true,
        title: "crashed",
        webPreferences: { backgroundThrottling: false },
        x: -9999,
        y: -9999,
        roundedCorners: false,
        type: "toolbar"
    });

    await new Promise<void>(resolve => {
        crashedWindow!.once("ready-to-show", resolve);
        crashedWindow!.loadURL(html);
    });

    crashedWindow.showInactive();

    cachedSourceId = null;
    for (let i = 0; i < 20; i++) {
        const sources = await desktopCapturer.getSources({ types: ["window"] });
        const id = sources.find(s => s.name === "crashed")?.id ?? null;
        if (id) { cachedSourceId = id; return id; }
        await new Promise(r => setTimeout(r, 50));
    }

    return null;
}

export function updateCrashMode(_e: IpcMainInvokeEvent) {
    if (!crashedWindow || crashedWindow.isDestroyed()) return;
    const mode = getMode();
    activeMode = mode;
    crashedWindow.loadURL(Modes[mode] ?? Modes.black);
}

export function stopCrashSource(_e: IpcMainInvokeEvent) {
    if (!crashedWindow || crashedWindow.isDestroyed()) return;
    crashedWindow.hide();
}
