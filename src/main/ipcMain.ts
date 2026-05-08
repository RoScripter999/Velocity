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

import "./updater";
import "./ipcPlugins";
import "./settings";

import { debounce } from "@shared/debounce";
import { IpcEvents } from "@shared/IpcEvents";
import { BrowserWindow, ipcMain, shell, systemPreferences } from "electron";
import monacoHtml from "file://monacoWin.html?minify&base64";
import { FSWatcher, mkdirSync, readFileSync, unlinkSync, watch, writeFileSync } from "fs";
import { open, readdir, readFile } from "fs/promises";
import { join, normalize } from "path";

import { registerCspIpcHandlers } from "./csp/manager";
import { getThemeInfo, stripBOM, type UserThemeHeader } from "./themes";
import { ALLOWED_PROTOCOLS, QUICKCSS_PATH, SETTINGS_DIR, THEMES_DIR } from "./utils/constants";
import { makeLinksOpenExternally } from "./utils/externalLinks";

const RENDERER_CSS_PATH = join(__dirname, "renderer.css");

mkdirSync(THEMES_DIR, { recursive: true });

registerCspIpcHandlers();

export function ensureSafePath(basePath: string, path: string) {
    const normalizedBasePath = normalize(basePath + "/");
    const newPath = join(basePath, path);
    const normalizedPath = normalize(newPath);
    return normalizedPath.startsWith(normalizedBasePath) ? normalizedPath : null;
}

async function readCss() {
    try {
        return await readFile(QUICKCSS_PATH, "utf-8");
    } catch {
        return "";
    }
}

async function listThemes(): Promise<UserThemeHeader[]> {
    const files = await readdir(THEMES_DIR).catch(() => []);

    const themeInfo: UserThemeHeader[] = [];

    for (const fileName of files) {
        if (!fileName.endsWith(".css")) continue;

        const data = await getThemeData(fileName).then(stripBOM).catch(() => null);
        if (data == null) continue;

        themeInfo.push(getThemeInfo(data, fileName));
    }

    return themeInfo;
}


function getThemeData(fileName: string) {
    fileName = fileName.replace(/\?v=\d+$/, "");
    const safePath = ensureSafePath(THEMES_DIR, fileName);
    if (!safePath) return Promise.reject(`Unsafe path ${fileName}`);
    return readFile(safePath, "utf-8");
}

ipcMain.handle(IpcEvents.OPEN_QUICKCSS, () => shell.openPath(QUICKCSS_PATH));

ipcMain.handle(IpcEvents.OPEN_EXTERNAL, (_, url) => {
    try {
        var { protocol } = new URL(url);
    } catch {
        throw "Malformed URL";
    }
    if (!ALLOWED_PROTOCOLS.includes(protocol))
        throw "Disallowed protocol.";

    shell.openExternal(url);
});

ipcMain.handle(IpcEvents.GET_QUICK_CSS, () => readCss());
ipcMain.handle(IpcEvents.SET_QUICK_CSS, (_, css) =>
    writeFileSync(QUICKCSS_PATH, css)
);

ipcMain.handle(IpcEvents.GET_THEMES_LIST, () => listThemes());
ipcMain.handle(IpcEvents.GET_THEME_DATA, (_, fileName) => getThemeData(fileName));
ipcMain.handle(IpcEvents.GET_THEME_SYSTEM_VALUES, () => ({
    // win & mac only
    "os-accent-color": `#${systemPreferences.getAccentColor?.() || ""}`
}));

ipcMain.handle(IpcEvents.GET_VELOCITY_THEMES, async () => {
    const res = await fetch("https://api.github.com/repos/Velocitcs/Velocity/releases/latest");
    const json = await res.json();

    const themesAsset = json.assets.find((a: any) => a.name === "themeLibThemes.json");
    const themesRes = await fetch(themesAsset.browser_download_url);

    return await themesRes.json();
});


ipcMain.handle(IpcEvents.UPLOAD_THEME, (_, fileName, css) => {
    const path = ensureSafePath(THEMES_DIR, fileName);
    if (!path) throw new Error(`Unsafe path for theme: ${fileName}`);
    writeFileSync(path, css, "utf-8");
});

ipcMain.handle(IpcEvents.DELETE_THEME, (_, name) => {
    unlinkSync(join(THEMES_DIR, name));
});

ipcMain.handle(IpcEvents.OPEN_THEMES_FOLDER, (_, fileName?: string) =>
    fileName
        ? shell.showItemInFolder(join(THEMES_DIR, fileName))
        : shell.openPath(THEMES_DIR)
);
ipcMain.handle(IpcEvents.OPEN_SETTINGS_FOLDER, () => shell.openPath(SETTINGS_DIR));

export function initIpc(mainWindow: BrowserWindow) {
    let quickCssWatcher: FSWatcher | undefined;

    open(QUICKCSS_PATH, "a+").then(fd => {
        fd.close();
        quickCssWatcher = watch(QUICKCSS_PATH, { persistent: false }, debounce(async () => {
            mainWindow.webContents.postMessage(IpcEvents.QUICK_CSS_UPDATE, await readCss());
        }, 50));
    }).catch(() => { });

    const themesWatcher = watch(THEMES_DIR, { persistent: false }, debounce(() => {
        mainWindow.webContents.postMessage(IpcEvents.THEME_UPDATE, void 0);
    }));

    mainWindow.once("closed", () => {
        quickCssWatcher?.close();
        themesWatcher.close();
    });
}

ipcMain.handle(IpcEvents.OPEN_MONACO_EDITOR, async () => {
    const title = "Velocity QuickCSS Editor";
    const existingWindow = BrowserWindow.getAllWindows().find(w => w.title === title);
    if (existingWindow && !existingWindow.isDestroyed()) {
        existingWindow.focus();
        return;
    }

    const win = new BrowserWindow({
        title,
        autoHideMenuBar: true,
        darkTheme: true,
        webPreferences: {
            preload: join(__dirname, IS_DISCORD_DESKTOP ? "preload.js" : "velocityDesktopPreload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    win.removeMenu();

    makeLinksOpenExternally(win);

    await win.loadURL(`data:text/html;base64,${monacoHtml}`);
});

ipcMain.handle(IpcEvents.GET_RENDERER_CSS, () => readFile(RENDERER_CSS_PATH, "utf-8"));

if (IS_DISCORD_DESKTOP) {
    ipcMain.on(IpcEvents.PRELOAD_GET_RENDERER_JS, e => {
        e.returnValue = readFileSync(join(__dirname, "renderer.js"), "utf-8");
    });
}
