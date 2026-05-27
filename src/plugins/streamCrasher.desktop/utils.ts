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

import type { PluginNative } from "@utils/types";
import { ApplicationStreamingStore, VoiceActions } from "@webpack/common";

export let lastSourceId: string | null = null;
let lastQualityOptions: { preset?: number; resolution?: number; frameRate?: number; } | null = null;
let crashSourceId: string | null = null;
let currentUpdate: Promise<void> | null = null;
let pendingState: boolean | null = null;

const Native = VelocityNative.pluginHelpers.StreamCrasher as PluginNative<typeof import("./native")>;

export function setCrashMode() {
    Native.updateCrashMode();
}

/** returns true if the source was actually saved.. */
export function setLastSourceId(sourceId: string | null, qualityOptions?: any): boolean {
    if (!sourceId || sourceId === crashSourceId) return false;
    lastSourceId = sourceId;
    if (qualityOptions) lastQualityOptions = qualityOptions;
    return true;
}

async function getSourceId(isEnabled: boolean): Promise<string> {
    if (isEnabled) {
        if (!lastSourceId) {
            const sources = await DiscordNative.desktopCapture.getDesktopCaptureSources({ types: ["screen"] });
            lastSourceId = sources[0]?.id ?? "default";
        }

        crashSourceId = await Native.createCrashSource();
        return crashSourceId ?? "";
    }

    crashSourceId = null;
    return lastSourceId ?? (await DiscordNative.desktopCapture.getDesktopCaptureSources({ types: ["screen"] }))[0]?.id ?? "default";
}

async function doUpdateStream(isEnabled: boolean) {
    try {
        // The streaming store may not have updated yet when called from MEDIA_ENGINE_SET_GO_LIVE_SOURCE
        let streaming = ApplicationStreamingStore.getCurrentUserActiveStream() != null;
        if (!streaming) {
            await new Promise(resolve => setTimeout(resolve, 500));
            streaming = ApplicationStreamingStore.getCurrentUserActiveStream() != null;
            if (!streaming) return;
        }

        const sourceId = await getSourceId(isEnabled);

        VoiceActions.setGoLiveSource({
            desktopSettings: { sourceId, sound: false },
            qualityOptions: isEnabled ? { preset: 2, resolution: 0, frameRate: 60 } : (lastQualityOptions ?? { preset: 2, resolution: 0, frameRate: 60 }),
            context: "stream"
        });

        if (!isEnabled) Native.stopCrashSource();
    } catch { }
}

export function updateStream(isEnabled: boolean) {
    if (currentUpdate) {
        pendingState = isEnabled;
        return;
    }

    currentUpdate = doUpdateStream(isEnabled).finally(() => {
        currentUpdate = null;
        if (pendingState !== null) {
            const next = pendingState;
            pendingState = null;
            updateStream(next);
        }
    });
}
