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
import ErrorBoundary from "@components/ErrorBoundary";
import { Icon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { classes } from "@utils/misc";
import definePlugin, { OptionType, type PluginNative } from "@utils/types";
import { findComponentByCodeLazy, findCssClassesLazy } from "@webpack";
import { ApplicationStreamingStore, Popout, useEffect, useRef, UserStore, useStateFromStores } from "@webpack/common";

import { CrasherContextMenu, StreamCrasherPatch } from "./menu";
import { setCrashMode, setLastSourceId, updateStream } from "./utils";

export const crashModeLabels: Record<string, { value: string; subText?: string; }> = {
    freeze: { value: "Freeze", subText: "Freezes the stream" },
    flashing: { value: "Flashing", subText: "Based on FrameRate" },
    white: { value: "White Screen" },
    colors: { value: "Color Cycle", subText: "Based on FrameRate" },
    static: { value: "Static", subText: "TV Noise, Based on FrameRate" },
    bsod: { value: "Crash Screen", subText: "OS-specific BSOD" },
    image: { value: "Image", subText: "Custom image URL" }
};

const Native = VelocityNative.pluginHelpers.StreamCrasher as PluginNative<typeof import("./native")>;

export const settings = definePluginSettings({
    isEnabled: {
        type: OptionType.BOOLEAN,
        description: "Crashing state",
        default: false,
        onChange: val => updateStream(val)
    },
    showChevron: {
        type: OptionType.BOOLEAN,
        description: "Show dropdown chevron (options menu)",
        default: true
    },
    keybindEnabled: {
        type: OptionType.BOOLEAN,
        description: "Having the ability to toggle the crasher with a keybind (F7)",
        default: false
    },
    crashMode: {
        type: OptionType.SELECT,
        description: "What viewers see when the crasher is active",
        options: Object.entries(crashModeLabels).map(([value, { value: label, subText }], i) => ({ label, value, subtext: subText, default: i === 0 })),
        onChange: () => settings.store.isEnabled ? updateStream(true) : setCrashMode()
    },
    imageUrl: {
        type: OptionType.STRING,
        description: "Image URL to display when using Image mode",
        default: "",
        placeholder: "https://example.com/image.png",
        componentProps: { onBlur: setCrashMode },
        hidden() { return this.store.crashMode !== "image"; }
    },
    buttonLocation: {
        type: OptionType.SELECT,
        description: "Where to place the crasher button",
        options: [
            { label: "Account Section", value: "account" },
            { label: "Voice Panel", value: "voice" },
            { label: "Streaming Panel", value: "stream", default: true }
        ],
        restartNeeded: true
    }
});

// Same as GameActivityToggle
const Button = findComponentByCodeLazy(".GREEN,positionKeyStemOverride:");
const Classes = findCssClassesLazy("audioButtonWithMenu", "audioButtonParent", "popoutOpen", "buttonChevron");
const ButtonClasses = findCssClassesLazy("redGlow", "enabled", "disabled", "plated");

const CrashIcon = ({ isEnabled }) => (
    <Icon width="24" height="24" viewBox="0 0 24 24">
        <path
            fill={isEnabled ? "var(--icon-voice-muted)" : "currentColor"}
            d="M18.75 6c0 2.08-1.19 3.91-3 4.98V12c0 .83-.67 1.5-1.5 1.5h-4.5c-.83 0-1.5-.67-1.5-1.5v-1.02c-1.81-1.08-3-2.91-3-4.98C5.25 2.69 8.27 0 12 0s6.75 2.69 6.75 6zM9.38 8.25c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm6.75-1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM4.8 15c.3-.6 1-.85 1.6-.55L12 17l5.6-2.55c.6-.3 1.35-.05 1.6.55s.05 1.35-.55 1.6L14.8 18l3.65 1.6c.6.3.85 1 .55 1.6s-1 .85-1.6.55L12 19l-5.6 2.75c-.6.3-1.35.05-1.6-.55s-.05-1.35.55-1.6L9.2 18l-3.65-1.6c-.6-.3-.85-1-.55-1.6z"
        />
    </Icon>
);

const ChevronIcon = ({ isEnabled, isShown }) => (
    <Icon width="15" height="15" fill="none" style={{ transform: isShown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
        <path fill={isEnabled ? "var(--icon-voice-muted)" : "currentColor"} d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z" />
    </Icon>
);

function CrashButton() {
    const buttonRef = useRef(null);
    const { isEnabled, showChevron } = settings.use(["isEnabled", "showChevron"]);
    const isStreaming = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getActiveStreamForUser(UserStore.getCurrentUser()?.id) != null);

    useEffect(() => {
        if (isStreaming && isEnabled) {
            updateStream(isEnabled);
        }
    }, [isStreaming, isEnabled]);

    if (!isStreaming) return null;

    if (!showChevron) {
        return (
            <Popout
                position="top"
                align="left"
                animation={Popout.Animation.FADE}
                spacing={4}
                targetElementRef={buttonRef}
                renderPopout={({ closePopout }) => <CrasherContextMenu closePopout={closePopout} settings={settings} />}
            >
                {({ onClick: openPopout }) => (
                    <div ref={buttonRef}>
                        <Button
                            aria-checked={isEnabled}
                            aria-label={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                            icon={() => <CrashIcon isEnabled={isEnabled} />}
                            onClick={() => settings.store.isEnabled = !settings.store.isEnabled}
                            onContextMenu={openPopout}
                            plated={false}
                            redGlow={isEnabled}
                            role="switch"
                            tooltipText={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                        />
                    </div>
                )}
            </Popout>
        );
    }

    return (
        <Popout
            position="top"
            align="left"
            animation={Popout.Animation.FADE}
            spacing={4}
            targetElementRef={buttonRef}
            renderPopout={({ closePopout }) => <CrasherContextMenu closePopout={closePopout} settings={settings} />}
        >
            {({ onClick: openPopout }, { isShown }) => (
                <div
                    ref={buttonRef}
                    className={classes(Classes.audioButtonParent, isEnabled && ButtonClasses.redGlow, isShown && Classes.popoutOpen)}
                >
                    <Button
                        aria-checked={isEnabled}
                        aria-label={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                        className={classes(Classes.audioButtonWithMenu, ButtonClasses.enabled)}
                        icon={() => <CrashIcon isEnabled={isEnabled} />}
                        onClick={() => settings.store.isEnabled = !settings.store.isEnabled}
                        onContextMenu={openPopout}
                        plated={false}
                        redGlow={isEnabled}
                        role="switch"
                        tooltipShouldShow={!isShown}
                        tooltipText={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                    />
                    <Button
                        aria-label="Crasher Options"
                        className={classes(Classes.buttonChevron, isShown && Classes.popoutOpen, ButtonClasses.enabled)}
                        icon={() => <ChevronIcon isEnabled={isEnabled} isShown={isShown} />}
                        onClick={openPopout}
                        onContextMenu={openPopout}
                        plated={false}
                        redGlow={isEnabled}
                        tooltipForceOpen={false}
                        tooltipShouldShow={!isShown}
                        tooltipText="Crasher Options"
                    />
                </div>
            )}
        </Popout>
    );
}

export default definePlugin({
    name: "StreamCrasher",
    description: "Crashes/Freezes your stream in Discord calls when you're screensharing",
    tags: ["Privacy", "Utility", "Voice"],
    searchTerms: ["StreamFreezer", "ScreenshareCrasher"],
    authors: [Devs.RoScripter999],
    settings,

    contextMenus: {
        "manage-streams": StreamCrasherPatch
    },

    start() {
        window.addEventListener("keydown", this.event);
    },

    stop() {
        window.removeEventListener("keydown", this.event);
    },

    event(e: KeyboardEvent) {
        if (!settings.store.keybindEnabled) return;
        if (e.code === "F7" && e.type === "keydown" && !e.repeat) {
            settings.store.isEnabled = !settings.store.isEnabled;
        }
    },

    flux: {
        MEDIA_ENGINE_SET_GO_LIVE_SOURCE(data) {
            const sourceId = data.settings?.desktopSettings?.sourceId;
            const qualityOptions = data.settings?.qualityOptions;
            if (sourceId && sourceId !== "" && setLastSourceId(sourceId, qualityOptions) && settings.store.isEnabled)
                updateStream(true);
        },
        STREAM_STOP() {
            Native.stopCrashSource();
        }
    },

    patches: [
        {
            // Crashing the stream when stream starts to avoid the split second delay
            // when the flux event fires
            find: "_handleVideo",
            replacement: {
                match: /if\(null!=this\._connection&&this\.userId!==t\)\{/,
                replace: 'if($self.isSettingEnabled&&this.context==="Stream")return;$&'
            }
        },
        {
            find: "#{intl::USER_PROFILE_ACCOUNT_POPOUT_BUTTON_A11Y_LABEL}",
            replacement: {
                match: /(className:\i\.\i,style:\i,children:\[)/,
                replace: "$1$self.CrashButton(),"
            },
            predicate: () => settings.store.buttonLocation === "account"
        },
        {
            find: "NOISE_CANCELLATION_POPOUT}",
            replacement: {
                match: /className:\i\.\i,children:\[\(0,\i\.jsx\)\(\i,\{\}\),/,
                replace: "$&$self.CrashButton(),"
            },
            predicate: () => settings.store.buttonLocation === "voice"
        },
        {
            find: "#{intl::uQn9B8::raw})))",
            replacement: {
                match: /children:\s*\[\i\s*\?\?\s*\i\s*\?\?\s*\i,/,
                replace: "$&$self.CrashButton(),"
            },
            predicate: () => settings.store.buttonLocation === "stream"
        }
    ],

    get isSettingEnabled() {
        return settings.store.isEnabled;
    },

    CrashButton: ErrorBoundary.wrap(CrashButton, { noop: true })
});
