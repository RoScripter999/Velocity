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

import type { PluginNative } from "@utils/types";
import { ApplicationStreamingStore, OverlayRTCConnectionStore, VoiceActions } from "@webpack/common";

export let lastSourceId: string | null = null;
let fakeSourceId: string | null = null;

const Native = VelocityNative.pluginHelpers.StreamCrasher as PluginNative<typeof import("./native")>;

export function setLastSourceId(sourceId: string | null) {
    if (!sourceId || sourceId === fakeSourceId) return;
    lastSourceId = sourceId;
}

export async function getSourceId(isEnabled: boolean) {
    if (isEnabled) {
        if (!lastSourceId) {
            const sources = await DiscordNative.desktopCapture.getDesktopCaptureSources({ types: ["screen"] });
            lastSourceId = sources[0]?.id ?? "default";
        }

        fakeSourceId = await Native.createFakeSource();
        return fakeSourceId ?? "";
    }

    fakeSourceId = null;
    const sources = await DiscordNative.desktopCapture.getDesktopCaptureSources({ types: ["screen"] });
    return sources[0]?.id ?? "default";
}

export async function updateStream(isEnabled: boolean) {
    const isStreaming = ApplicationStreamingStore.getCurrentUserActiveStream() != null;
    if (!isStreaming) return;

    const sourceId = await getSourceId(isEnabled);

    while (OverlayRTCConnectionStore.getConnectionState() !== "RTC_CONNECTED") {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    VoiceActions.setGoLiveSource({
        desktopSettings: { sourceId, sound: false },
        qualityOptions: { preset: 0, resolution: 1080, frameRate: 60 },
        context: "stream"
    });

    if (!isEnabled) Native.stopFakeSource();
}
