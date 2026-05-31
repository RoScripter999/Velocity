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
import { BrowserWindow, desktopCapturer, type IpcMainInvokeEvent, net } from "electron";
import colorsHtml from "file://./modes/colors.html?minify";
import flashingHtml from "file://./modes/flashing.html?minify";
import imageHtml from "file://./modes/image.html?minify";
import staticHtml from "file://./modes/static.html?minify";
import whiteHtml from "file://./modes/white.html?minify";
import { platform } from "os";

let crashedWindow: BrowserWindow | null = null;
let cachedSourceId: string | null = null;
let activeMode: string | null = null;

const AssetsURL = "https://raw.githubusercontent.com/Discord-Velocity/PluginAssets/main/StreamCrasher";

const p = platform();
const bsodUrl = p === "darwin" ? `${AssetsURL}/crashedMac.png`
    : p === "linux" ? `${AssetsURL}/crashedLinux.png`
        : `${AssetsURL}/crashedWindows10.png`;

const Modes: Record<string, string> = {
    flashing: `data:text/html,${encodeURIComponent(flashingHtml)}`,
    white: `data:text/html,${encodeURIComponent(whiteHtml)}`,
    colors: `data:text/html,${encodeURIComponent(colorsHtml)}`,
    static: `data:text/html,${encodeURIComponent(staticHtml)}`
};

function getMode(): string {
    return RendererSettings.store.plugins?.StreamCrasher?.crashMode ?? "freeze";
}

function getModeUrl(mode: string): string | null {
    if (mode === "image") return RendererSettings.store.plugins?.StreamCrasher?.imageUrl || null;
    if (mode === "bsod") return bsodUrl;
    return null;
}

function isWindowAlive(): boolean {
    return crashedWindow !== null && !crashedWindow.isDestroyed();
}

async function buildImageHtml(url: string): Promise<string | null> {
    try {
        const buf = Buffer.from(await (await net.fetch(url)).arrayBuffer());
        const mime = /\.png(\?|$)/i.test(url) ? "image/png" : /\.gif(\?|$)/i.test(url) ? "image/gif" : "image/jpeg";
        const src = `data:${mime};base64,${buf.toString("base64")}`;
        return `data:text/html,${encodeURIComponent(imageHtml.replace("__IMAGE_SRC__", src))}`;
    } catch {
        return null;
    }
}

async function findSourceId(): Promise<string | null> {
    for (let i = 0; i < 20; i++) {
        const sources = await desktopCapturer.getSources({ types: ["window"] });
        const id = sources.find(s => s.name === "crashed")?.id ?? null;
        if (id) return id;
        await new Promise(r => setTimeout(r, 50));
    }
    return null;
}

export async function createCrashSource(_e: IpcMainInvokeEvent): Promise<string | null> {
    const mode = getMode();

    if (mode === "freeze") return "-1";

    const url = getModeUrl(mode);
    const html = (url ? await buildImageHtml(url) : null) ?? Modes[mode] ?? Modes.flashing;
    const modeKey = url ? `${mode}:${url}` : mode;

    if (isWindowAlive()) {
        if (activeMode !== modeKey) {
            activeMode = modeKey;
            crashedWindow!.loadURL(html);
        }
        crashedWindow!.showInactive();
        return cachedSourceId;
    }

    activeMode = modeKey;
    crashedWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: false,
        frame: false,
        hasShadow: false,
        resizable: false,
        movable: false,
        skipTaskbar: true,
        title: "crashed",
        webPreferences: { backgroundThrottling: false },
        x: -9999,
        y: -9999,
        roundedCorners: false
    });

    await new Promise<void>(resolve => {
        crashedWindow?.once("ready-to-show", resolve);
        crashedWindow?.loadURL(html);
    });

    crashedWindow.showInactive();
    cachedSourceId = await findSourceId();
    return cachedSourceId;
}

export async function updateCrashMode(_e: IpcMainInvokeEvent) {
    if (!isWindowAlive()) return;
    const mode = getMode();
    const url = getModeUrl(mode);
    const imageHtml = url ? await buildImageHtml(url) : null;
    const html = imageHtml ?? Modes[mode] ?? Modes.white;
    activeMode = url ? `${mode}:${url}` : mode;
    crashedWindow?.loadURL(html);
}

export function stopCrashSource(_e: IpcMainInvokeEvent) {
    if (!isWindowAlive()) return;
    crashedWindow?.hide();
}
