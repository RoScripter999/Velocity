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

import { app } from "electron";
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, statSync } from "original-fs";
import { basename, dirname, join } from "path";

function copyDirSync(src: string, dest: string) {
    mkdirSync(dest, { recursive: true });

    for (const file of readdirSync(src)) {
        const srcPath = join(src, file);
        const destPath = join(dest, file);
        const stat = statSync(srcPath);

        if (stat.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

function isNewer($new: string, old: string) {
    const newParts = $new.slice(4).split(".").map(Number);
    const oldParts = old.slice(4).split(".").map(Number);

    for (let i = 0; i < oldParts.length; i++) {
        if (newParts[i] > oldParts[i]) return true;
        if (newParts[i] < oldParts[i]) return false;
    }
    return false;
}

function patchLatest() {
    if (process.env.DISABLE_UPDATER_AUTO_PATCHING) return;

    try {
        const currentAppPath = dirname(process.execPath);
        const currentVersion = basename(currentAppPath);
        const discordPath = join(currentAppPath, "..");

        const latestVersion = readdirSync(discordPath).reduce((prev, curr) => {
            return (curr.startsWith("app-") && isNewer(curr, prev))
                ? curr
                : prev;
        }, currentVersion as string);

        if (latestVersion === currentVersion) return;

        const oldResources = join(discordPath, currentVersion, "resources");
        const oldVelocityAsar = join(oldResources, "app.asar");

        const resources = join(discordPath, latestVersion, "resources");
        const newAppAsar = join(resources, "app.asar");
        const newAppAsarBackup = join(resources, "_app.asar");

        if (!existsSync(oldVelocityAsar) || !existsSync(newAppAsar) || existsSync(newAppAsarBackup)) return;

        console.info(`[Velocity] Detected Host Update (${currentVersion} -> ${latestVersion}). Repatching...`);

        renameSync(newAppAsar, newAppAsarBackup);

        const oldStat = statSync(oldVelocityAsar);
        if (oldStat.isDirectory()) {
            copyDirSync(oldVelocityAsar, newAppAsar);
        } else {
            copyFileSync(oldVelocityAsar, newAppAsar);
        }
    } catch (err) {
        console.error("[Velocity] Failed to repatch latest host update", err);
    }
}

// Try to patch latest on before-quit
// Discord's Win32 updater will call app.quit() on restart and open new version on will-quit
app.on("before-quit", patchLatest);
