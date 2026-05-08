/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 Velocitcs and contributors
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

import { PlainSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import { chooseFile, saveFile } from "@utils/web";
import { moment, Toasts } from "@webpack/common";

import { DataStore } from "..";

export type BackupType = "all" | "plugins" | "css" | "datastore";

const toast = (type: string, message: string) =>
    Toasts.show({
        type,
        message,
        id: Toasts.genId()
    });

const toastSuccess = () =>
    toast(Toasts.Type.SUCCESS, "Settings successfully imported. Restart to apply changes!");

const toastFailure = (err: any) =>
    toast(Toasts.Type.FAILURE, `Failed to import settings: ${String(err)}`);

const logger = new Logger("SettingsSync:Offline", "#39b7e0");

function deepMerge<T extends object>(target: T, source: T): T {
    for (const key in source) {
        const sourceVal = source[key];

        if (sourceVal !== null && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
            if (target[key] === null || target[key] === undefined || typeof target[key] !== "object" || Array.isArray(target[key])) {
                target[key] = {} as any;
            }
            deepMerge(target[key] as object, sourceVal as object);
        } else {
            target[key] = sourceVal;
        }
    }
    return target;
}

function isSafeObject(obj: any) {
    if (obj == null || typeof obj !== "object") return true;

    for (const key in obj) {
        if (["__proto__", "constructor", "prototype"].includes(key)) {
            return false;
        }
        if (!isSafeObject(obj[key])) {
            return false;
        }
    }

    return true;
}

export async function importSettings(data: string, type: BackupType = "all", cloud = false, showToast: boolean = false) {
    try {
        try {
            var parsed = JSON.parse(data);
        } catch (err) {
            console.log(data);
            throw new Error("Failed to parse JSON: " + String(err));
        }

        if (!isSafeObject(parsed))
            throw new Error("Unsafe Settings");

        switch (type) {
            case "all": {
                if (!cloud && (!("settings" in parsed)))
                    throw new Error("Invalid Settings. Plugin settings is required for this import try a different one.");

                if (parsed.settings) {
                    deepMerge(PlainSettings, parsed.settings);
                    await VelocityNative.settings.set(PlainSettings);
                }
                if (parsed.quickCss) await VelocityNative.quickCss.set(parsed.quickCss);
                if (parsed.dataStore) await DataStore.setMany(parsed.dataStore);
                break;
            }
            case "plugins": {
                if (!parsed.settings) throw new Error("Plugin settings missing");

                deepMerge(PlainSettings, parsed.settings);
                await VelocityNative.settings.set(PlainSettings);
                break;
            }
            case "css": {
                if (!parsed.quickCss) throw new Error("CSS missing");

                await VelocityNative.quickCss.set(parsed.quickCss);
                break;
            }
            case "datastore": {
                if (!parsed.dataStore) throw new Error("DataStore data missing");

                await DataStore.setMany(parsed.dataStore);
                break;
            }
        }

        if (showToast) toastSuccess();
    } catch (err) {
        if (showToast) toastFailure(err);
        throw err;
    }
}

export async function exportSettings({ syncDataStore = true, type = "all", minify }: { syncDataStore?: boolean; type?: BackupType; minify?: boolean; }) {
    const settings = VelocityNative.settings.get();
    const quickCss = await VelocityNative.quickCss.get();
    let dataStore: any;

    if (syncDataStore) {
        try {
            dataStore = await DataStore.entries();
        } catch (err) {
            logger.error("Failed to read DataStore entries:", err);

            if (type === "all") {
                logger.warn("Skipping DataStore in backup due to size. Export DataStore separately if needed.");
                toast(Toasts.Type.MESSAGE, "DataStore too large - exported without it. Use 'Export DataStore' separately if needed.");
                dataStore = undefined;
            } else if (type === "datastore") {
                throw new Error("DataStore is too large to export. Please clear some plugin data and try again.");
            }
        }
    }

    switch (type) {
        case "all": {
            return JSON.stringify({ settings, quickCss, ...(dataStore && { dataStore }) }, null, minify ? undefined : 4);
        }
        case "plugins": {
            return JSON.stringify({ settings }, null, minify ? undefined : 4);
        }
        case "css": {
            return JSON.stringify({ quickCss }, null, minify ? undefined : 4);
        }
        case "datastore": {
            return JSON.stringify({ dataStore }, null, minify ? undefined : 4);
        }
    }
}

export async function downloadSettingsBackup(type: BackupType = "all", { minify }: { minify?: boolean; } = {}) {
    try {
        const syncDataStore = type === "all" || type === "datastore";
        const backup = await exportSettings({ minify, type, syncDataStore });
        const filename = `velocity-${type}-backup-${moment().format("YYYY-MM-DD")}.json`;
        const data = new TextEncoder().encode(backup);

        if (IS_DISCORD_DESKTOP) {
            DiscordNative.fileManager.saveWithDialog(data, filename);
        } else {
            saveFile(new File([data], filename, { type: "application/json" }));
        }
    } catch (err) {
        logger.error("Failed to export settings:", err);
        toast(Toasts.Type.FAILURE, "Failed to export settings, check console");
        throw err;
    }
}

export async function uploadSettingsBackup(type: BackupType = "all", showToast = true): Promise<void> {
    if (IS_DISCORD_DESKTOP) {
        const [file] = await DiscordNative.fileManager.openFiles({
            filters: [
                { name: "Velocity Settings Backup", extensions: ["json"] },
                { name: "all", extensions: ["*"] }
            ]
        });

        if (file) {
            try {
                await importSettings(new TextDecoder().decode(file.data), type);
                if (showToast) toastSuccess();
            } catch (err) {
                logger.error(err);
                if (showToast) toastFailure(err);
            }
        }
    } else {
        const file = await chooseFile("application/json");
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                await importSettings(reader.result as string, type);
                if (showToast) toastSuccess();
            } catch (err) {
                logger.error(err);
                if (showToast) toastFailure(err);
            }
        };
        reader.readAsText(file);
    }
}
