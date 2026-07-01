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

import { definePluginSettings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByCodeLazy, findComponentByCodeLazy } from "@webpack";
import { ApplicationStreamingSettingsStore, ApplicationStreamingStore, ChannelActions, ChannelStore, Icons, MediaEngineStore, OverlayRTCConnectionStore, Popout, useRef, VoiceActions, VoiceStateStore } from "@webpack/common";

import { AutoJoinMenu, AutoStreamPatch, StreamSettingsContextMenuPatch } from "./contextMenu";

const TrayButton = findComponentByCodeLazy('"activeLight":"primaryLight"', "caretAriaLabel", "isTrayButton");

const StatusSettings = getUserSettingLazy<string>("status", "status")!;

const createStream = findByCodeLazy("startStreamWithSource");

interface Screen {
    icon?: string;
    id: string;
    name: string;
    url: Base64URLString;
}

export const statusOptions = [
    { label: "Invisible", value: "invisible" },
    { label: "Do not disturb", value: "dnd" },
    { label: "Idle", value: "idle" },
    { label: "Online", value: "online" }
];

export const settings = definePluginSettings({
    autoJoinEnabled: {
        type: OptionType.BOOLEAN,
        description: "Enable auto join (can also be toggled via the voice tray button)",
        default: true
    },
    channelId: {
        type: OptionType.STRING,
        description: "Check for channel ids",
        default: ""
    },
    showVoiceButton: {
        type: OptionType.BOOLEAN,
        description: "Shows an button in the voice tray actions (only visible when in call)",
        default: true
    },
    voiceSetting: {
        type: OptionType.SELECT,
        description: "Audio state on join",
        options: [
            { label: "None", value: "none", default: true },
            { label: "Auto Mute", value: "mute" },
            { label: "Auto Deafen", value: "deafen" }
        ]
    },
    status: {
        type: OptionType.SELECT,
        displayName: "Join On Status",
        description: "On which status will it automatically join the call (privacy feature)",
        default: ["idle", "online"],
        options: statusOptions
    },
    autoStream: {
        type: OptionType.BOOLEAN,
        description: "Automatically start streaming on join",
        default: false,
        hidden: IS_WEB
    },
    streamSound: {
        type: OptionType.BOOLEAN,
        description: "Enable sound when streaming",
        hidden: IS_WEB,
        default: true
    },
    streamSource: {
        type: OptionType.SELECT,
        description: "Stream source",
        hidden: IS_WEB,
        default: "screen:0:0",
        options: async () => {
            const screens = await getScreens("GET_SCREENS");
            return screens.map((screen: Screen, index: number) => ({
                label: `Screen ${index + 1}`,
                value: screen.id
            }));
        }
    }
});

async function getScreens<Method extends "GET_SCREENS" | "GET_SCREEN_BY_SETTINGS">(method: Method): Promise<Method extends "GET_SCREENS" ? Screen[] : Screen> {
    const screens = await DiscordNative.desktopCapture.getDesktopCaptureSources({
        types: ["screen"]
    });

    if (method === "GET_SCREENS") return screens;

    if (method === "GET_SCREEN_BY_SETTINGS") return screens.find((s: Screen) => s.id === settings.store.streamSource);
    throw new Error("Invalid method");
}

async function startStream() {
    if (ApplicationStreamingStore.getCurrentUserActiveStream() != null) return;

    const sourceData = await getScreens("GET_SCREEN_BY_SETTINGS");
    const voiceSettings = ApplicationStreamingSettingsStore.getState();

    return void await createStream(
        {
            id: sourceData.id,
            name: sourceData.name,
            icon: sourceData.icon,
            ...voiceSettings,

            soundshareEnabled: settings.store.streamSound || false,
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

    if (!IS_WEB && settings.store.autoStream) {
        if (OverlayRTCConnectionStore.getConnectionState() === "RTC_CONNECTED") startStream();
        else OverlayRTCConnectionStore.addConditionalChangeListener(() => {

            if (OverlayRTCConnectionStore.getConnectionState() === "RTC_CONNECTED") {
                startStream();
                return false;
            }
            return true;
        });
    }
}

function AutoJoinToggleButton() {
    const { autoJoinEnabled } = settings.use(["autoJoinEnabled"]);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <Popout
            position="top"
            align="center"
            animation={Popout.Animation.FADE}
            spacing={4}
            targetElementRef={ref}
            renderPopout={({ closePopout }) => <AutoJoinMenu closePopout={closePopout} />}
        >
            {({ onClick: openPopout }, { isShown }) => (
                <TrayButton
                    ref={ref}
                    iconComponent={Icons.PhoneCallIcon}
                    label={autoJoinEnabled ? "Disable Auto Join" : "Enable Auto Join"}
                    isActive={autoJoinEnabled}
                    color={autoJoinEnabled ? "green" : undefined}
                    isTrayButton={true}
                    shouldShowTooltip={!isShown}
                    onPopoutClick={openPopout}
                    popoutOpen={isShown}
                    onClick={() => { settings.store.autoJoinEnabled = !settings.store.autoJoinEnabled; }}
                />
            )}
        </Popout>
    );
}

function getChannelIds(): string[] {
    const { channelId } = settings.store;
    if (!channelId) return [];
    return channelId.split(",").map(id => id.trim()).filter(id => id.length > 0);
}

function shouldJoinBasedOnStatus(): boolean {
    const status = StatusSettings.getSetting();
    const statusSettings = settings.store.status;

    if (!statusSettings || statusSettings.length === 0) return true;
    return statusSettings.includes(status);
}

export default definePlugin({
    name: "AutoJoinCall",
    description: "Automatically joins the specified DM or guild call(s)",
    authors: [Devs.RoScripter999],
    dependencies: ["UserSettingsAPI"],
    tags: ["Voice", "Shortcuts", "Friends"],
    settings,

    patches: [
        {
            // Game overlay button yay
            find: "ClickZoneDebugWidget crashed, too many clicks",
            lazy: true,
            replacement: {
                match: /(\(0,\i\.jsx\)\(\i,\{voiceChannel:\i,locked:\i\}\)\]\}\),\(0,\i\.jsx\)\("div",\{className:\i\(\)\()/,
                replace: "$self.AutoJoinToggleButton(),$1"
            },
            predicate: () => settings.store.showVoiceButton
        },
        {
            find: '"CenterControlTray: currentUser cannot be undefined"',
            replacement: {
                match: /(exitFullScreen:\w+,canGoLive:\w+,hasPermission:\w+\}\))(?=,!\w+&&)/,
                replace: "$1,$self.AutoJoinToggleButton()"
            },
            predicate: () => settings.store.showVoiceButton
        },
        {
            find: '"MediaEngineStore"',
            replacement: [{
                // VOICE_CHANNEL_SELECT: replace hardcoded false values so Discord won't
                // fight the mute/deaf state we're about to set in joinCall
                match: /\((\w+)\.mute\|\|(\w+)\.deaf\)&&\((\w+)\(\{deaf:!1,mute:!1\}\),(\w+\.eachConnection\(\w+\))\)/,
                replace: "($1.mute||$2.deaf)&&($3({deaf:$self.getDeafValue,mute:$self.getMuteValue}),$4)"
            },
            {
                // RTC_CONNECTED function. apply mute/deafen once the connection is established.
                match: /\.RTC_CONNECTED:(\w+)\(\)/,
                replace: ".RTC_CONNECTED:$1(),$self.changeUserVoiceState()"
            }]
        }
    ],

    start() {
        const channelIds = getChannelIds();
        if (!settings.store.autoJoinEnabled || channelIds.length === 0 || !shouldJoinBasedOnStatus()) return;

        channelIds.forEach(id => joinCall(id));
    },

    contextMenus: {
        "more-settings-context": StreamSettingsContextMenuPatch,
        "manage-streams": AutoStreamPatch
    },

    flux: {
        CALL_CREATE(data: { channelId: string; }) {
            const channelIds = getChannelIds();
            if (!settings.store.autoJoinEnabled || channelIds.length === 0 || !shouldJoinBasedOnStatus()) return;

            if (channelIds.includes(data.channelId)) {
                setTimeout(() => joinCall(data.channelId), 100);
            }
        },

        CALL_UPDATE(data: { channelId: string; ringing?: string[]; }) {
            const channelIds = getChannelIds();
            if (!settings.store.autoJoinEnabled || channelIds.length === 0 || !shouldJoinBasedOnStatus()) return;

            const isRinging = Array.isArray(data.ringing) && data.ringing.length > 0;

            if (isRinging && channelIds.includes(data.channelId)) {
                setTimeout(() => joinCall(data.channelId), 100);
            }
        }
    },

    AutoJoinToggleButton: ErrorBoundary.wrap(AutoJoinToggleButton, { noop: true }),

    get getMuteValue() {
        return settings.store.voiceSetting === "mute";
    },

    get getDeafValue() {
        return settings.store.voiceSetting === "deafen";
    },

    changeUserVoiceState() {
        const { voiceSetting } = settings.store;
        if (voiceSetting === "none") return;
        if (!MediaEngineStore.isSelfMute() && (voiceSetting === "mute" || voiceSetting === "deafen"))
            VoiceActions.toggleSelfMute();
        if (!MediaEngineStore.isSelfDeaf() && voiceSetting === "deafen")
            VoiceActions.toggleSelfDeaf();
    }
});
