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

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { identity } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { Buttons, MediaEngineStore, Select, Slider, useState, useStateFromStores, VoiceActions } from "@webpack/common";

const settings = definePluginSettings({
    saveDropdownState: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Saves the dropdown state of the settings"
    }
});

function VolumeSlider({ label, max, getVal, setVal }: {
    label: string;
    max: number;
    getVal: () => number;
    setVal: (v: number) => void;
}) {
    const value = useStateFromStores([MediaEngineStore], getVal);

    return (
        <Slider
            maxValue={max}
            minValue={0}
            label={label}
            initialValue={value}
            onValueChange={setVal}
        />
    );
}

function DeviceSelect({ label, getDeviceId, getDevices, setDevice, disabled }: {
    label: string;
    getDeviceId: () => string;
    getDevices: () => any[];
    setDevice: (id: string) => void;
    disabled?: boolean;
}) {
    const selected = useStateFromStores([MediaEngineStore], getDeviceId);
    const devices = useStateFromStores([MediaEngineStore], getDevices);

    return (
        <Select
            options={devices.map(d => ({
                value: d.id,
                label: d.name || "No camera available"
            }))}
            serialize={identity}
            label={label}
            disabled={disabled}
            isSelected={v => v === selected}
            select={setDevice}
        />
    );
}

function VoiceSettings() {
    const [open, setOpen] = useState(settings.store.saveDropdownState);
    const videoDevices = useStateFromStores([MediaEngineStore], () => Object.values(MediaEngineStore.getVideoDevices()));
    const noCamera = videoDevices.length === 0 || videoDevices.every(d => d.disabled || !d.name);

    return (
        <div>
            <Buttons.TextButton text={open ? "▼ Hide" : "► Settings"} variant="secondary" onClick={() => {
                settings.store.saveDropdownState = !open;
                setOpen(!open);
            }} />
            {open && (
                <div className="vc-panelSettings-settings">
                    <VolumeSlider label="Output volume" max={200} getVal={() => MediaEngineStore.getOutputVolume()} setVal={VoiceActions.setOutputVolume} />
                    <VolumeSlider label="Input volume" max={100} getVal={() => MediaEngineStore.getInputVolume()} setVal={VoiceActions.setInputVolume} />
                    <DeviceSelect label="Output device" getDeviceId={() => MediaEngineStore.getOutputDeviceId()} getDevices={() => Object.values(MediaEngineStore.getOutputDevices())} setDevice={VoiceActions.setOutputDevice} />
                    <DeviceSelect label="Input device" getDeviceId={() => MediaEngineStore.getInputDeviceId()} getDevices={() => Object.values(MediaEngineStore.getInputDevices())} setDevice={VoiceActions.setInputDevice} />
                    <DeviceSelect label="Camera" getDeviceId={() => MediaEngineStore.getVideoDeviceId()} getDevices={() => Object.values(MediaEngineStore.getVideoDevices())} setDevice={VoiceActions.setVideoDevice} disabled={noCamera} />
                </div>
            )}
        </div>
    );
}

export default definePlugin({
    name: "VcPanelSettings",
    description: "Control voice settings inside the voice panel",
    tags: ["Voice", "Utility", "Shortcuts"],
    authors: [Devs.nin0dev, Devs.RoScripter999],
    settings,

    VoiceSettings: ErrorBoundary.wrap(VoiceSettings, { noop: true }),

    patches: [
        {
            find: ".VOICE_PANEL_INTRODUCTION)&&",
            replacement: {
                match: /(?<=\i\?null:\(0,\i\.jsx\)\(\i,\{channel:\i,canGoLive:\i\}\))/,
                replace: ",$self.VoiceSettings()"
            }
        }
    ]
});
