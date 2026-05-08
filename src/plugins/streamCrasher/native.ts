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

import { BrowserWindow, desktopCapturer, type IpcMainInvokeEvent } from "electron";

let fakeWindow: BrowserWindow | null = null;

const HTML = "data:text/html,<canvas id='c' width='1920' height='1080'></canvas><script>const ctx=document.getElementById('c').getContext('2d');let w=false;function draw(){ctx.fillStyle=w?'%23fff':'%23000';w=!w;ctx.fillRect(0,0,1920,1080);}window._int=setInterval(draw,500);draw();</script>";

export async function createFakeSource(_e: IpcMainInvokeEvent): Promise<string | null> {
    if (fakeWindow && !fakeWindow.isDestroyed()) {
        await fakeWindow.webContents.executeJavaScript("window._int=setInterval(draw,100);draw();");
        fakeWindow.showInactive();
        const sources = await desktopCapturer.getSources({ types: ["window"] });
        return sources.find(s => s.name === "VelocityFakeStream")?.id ?? null;
    }

    fakeWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: false,
        frame: false,
        skipTaskbar: true,
        title: "VelocityFakeStream",
        webPreferences: { backgroundThrottling: false },
        x: -9999,
        y: -9999,
        roundedCorners: false,
        type: "toolbar"
    });

    await new Promise<void>(resolve => {
        fakeWindow!.once("ready-to-show", resolve);
        fakeWindow!.loadURL(HTML);
    });

    fakeWindow.showInactive();
    await new Promise(resolve => setTimeout(resolve, 500));

    const sources = await desktopCapturer.getSources({ types: ["window"] });
    return sources.find(s => s.name === "VelocityFakeStream")?.id ?? null;
}

export function stopFakeSource(_e: IpcMainInvokeEvent) {
    if (!fakeWindow || fakeWindow.isDestroyed()) return;
    fakeWindow.webContents.executeJavaScript("clearInterval(window._int);audio.suspend();");
    fakeWindow.hide();
}
