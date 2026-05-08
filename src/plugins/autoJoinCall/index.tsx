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

import { definePluginSettings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import { sleep } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { filters, mapMangledModuleLazy } from "@webpack";
import { ApplicationStreamingStore, ChannelActions, ChannelStore, MediaEngineStore, OverlayRTCConnectionStore, Text, VoiceActions, VoiceStateStore } from "@webpack/common";

import { streamContextMenuPatch, streamEnablingPatch } from "./contextMenu";

const StatusSettings = getUserSettingLazy<string>("status", "status")!;

const { Z: createStream } = !IS_WEB ? mapMangledModuleLazy("startStreamWithSource", {
    Z: filters.byCode("startStreamWithSource")
}) : { Z: null };

interface Screen {
    icon: string;
    id: string;
    name: string;
    url: string;
}

const settings = definePluginSettings({
    channelId: {
        type: OptionType.STRING,
        description: "Check for channel ids",
        default: ""
    },
    voiceSetting: {
        type: OptionType.SELECT,
        description: "Audio state on join",
        restartNeeded: true,
        options: [
            { label: "None", value: "none", default: true },
            { label: "Auto Mute", value: "mute" },
            { label: "Auto Deafen", value: "deafen" }
        ]
    },
    status: {
        type: OptionType.SELECT,
        description: "Automaticly join call if status and finally give yourself some privacy.",
        default: ["invisible", "dnd", "online"],
        options: [
            { label: "Invisible", value: "invisible" },
            { label: "Do not disturb", value: "dnd" },
            { label: "Idle", value: "idle" },
            { label: "Online", value: "online" }
        ]
    },
    ...(IS_WEB ? {
        _: {
            type: OptionType.COMPONENT,
            component: () => <Flex justifyContent="center" alignItems="center">
                <Text variant="eyebrow">Velocity Web does not support auto stream.</Text>
            </Flex>
        }
    } : {
        autoStream: {
            type: OptionType.BOOLEAN,
            description: "Automatically start streaming on join",
            default: false
        },
        streamSound: {
            type: OptionType.BOOLEAN,
            description: "Enable sound when streaming",
            default: true
        },
        streamSource: {
            type: OptionType.SELECT,
            description: "Stream source",
            default: "screen:0:0",
            options: async () => {
                const screens = await getScreens("GET_SCREENS");
                return screens.map((screen: Screen, index: number) => ({
                    label: `Screen ${index + 1}`,
                    value: screen.id
                }));
            }
        }
    })
});

async function getScreens(method: "GET_SCREENS" | "GET_SCREEN_BY_SETTINGS") {
    const screens = await DiscordNative.desktopCapture.getDesktopCaptureSources({
        types: ["screen"]
    });

    if (method === "GET_SCREENS") {
        return screens;
    }
    if (method === "GET_SCREEN_BY_SETTINGS") {
        const streamSourceId = (settings.store as any).streamSource as string;
        return screens.find((s: Screen) => s.id === streamSourceId) as Screen;
    }
}

async function startStream() {
    if (IS_WEB || !createStream) return;
    if (ApplicationStreamingStore.getCurrentUserActiveStream() != null) return;

    const sourceData = await getScreens("GET_SCREEN_BY_SETTINGS");

    await createStream(
        {
            id: sourceData.id,
            name: sourceData.name,
            icon: sourceData.icon,

            preset: 0,
            resolution: 1080,
            fps: 60,
            soundshareEnabled: ((settings.store as any).streamSound as boolean) || false,
            previewDisabled: true,
            analyticsLocations: ["voice control tray"]
        }
    );
}

async function joinCall(channelId: string) {
    const channel = ChannelStore.getChannel(channelId);
    if (!channel) return;

    const voiceStates = VoiceStateStore.getVoiceStatesForChannel(channelId);
    if (Object.keys(voiceStates).length === 0) return;

    ChannelActions.selectVoiceChannel(channelId);

    while (OverlayRTCConnectionStore.getConnectionState() !== "RTC_CONNECTED") {
        await sleep(500);
    }

    const { voiceSetting } = settings.store;

    if (voiceSetting === "deafen") {
        if (!MediaEngineStore.isSelfDeaf()) {
            VoiceActions.toggleSelfDeaf();
        }
    } else if (voiceSetting === "mute") {
        if (!MediaEngineStore.isSelfMute()) {
            VoiceActions.toggleSelfMute();
        }
    }

    if (!IS_WEB && ((settings.store as any).autoStream as boolean)) {
        startStream();
    }
}

function getChannelIds(): string[] {
    const { channelId } = settings.store;
    if (!channelId) return [];
    return (channelId as string).split(",").map(id => id.trim()).filter(id => id.length > 0);
}

function shouldJoinBasedOnStatus(): boolean {
    const status = StatusSettings.getSetting();
    const statusSettings = (settings.store.status as unknown) as string[];

    if (!statusSettings || statusSettings.length === 0) return true;
    return statusSettings.includes(status);
}

export default definePlugin({
    name: "AutoJoinCall",
    description: "Automatically joins the specified DM or guild call(s)",
    authors: [Devs.RoScripter999],
    tags: ["Voice", "Shortcuts", "Friends"],
    settings,

    patches: [
        {
            find: '"MediaEngineStore"',
            replacement: {
                match: /\(\w+\.mute\|\|\w+\.deaf\)&&\(\w+\(\{deaf:!1,mute:!1\}\),\w+\.eachConnection\(\w+\)\)/,
                replace: "void 0"
            },
            predicate: () => settings.store.voiceSetting === "mute"
        }
    ],

    start() {
        const channelIds = getChannelIds();
        if (channelIds.length === 0 || !shouldJoinBasedOnStatus()) return;

        channelIds.forEach(id => joinCall(id));
    },

    contextMenus: !IS_WEB ? {
        "more-settings-context": streamContextMenuPatch,
        "manage-streams": streamEnablingPatch()
    } : undefined,

    flux: {
        CALL_CREATE(data: { channelId: string; }) {
            const channelIds = getChannelIds();
            if (channelIds.length === 0 || !shouldJoinBasedOnStatus()) return;

            if (channelIds.includes(data.channelId)) {
                setTimeout(() => joinCall(data.channelId), 100);
            }
        },

        CALL_UPDATE(data: { channelId: string; ringing?: string[]; }) {
            const channelIds = getChannelIds();
            if (channelIds.length === 0 || !shouldJoinBasedOnStatus()) return;

            const isRinging = Array.isArray(data.ringing) && data.ringing.length > 0;

            if (isRinging && channelIds.includes(data.channelId)) {
                setTimeout(() => joinCall(data.channelId), 100);
            }
        }
    }
});
