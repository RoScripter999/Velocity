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

import "./settings.css";

import { ExpandableCard } from "@components/ExpandableCard";
import { resolveError } from "@components/settings/tabs/plugins/components/Common";
import { classNameFactory } from "@utils/css";
import { ActivityType } from "@velocity-types/enums";
import { Buttons, Forms, Icons, Select, SnowflakeUtils, Text, TextInput, useState } from "@webpack/common";

import { type RPCPreset, setRpc, settings, TimestampMode } from ".";

const cl = classNameFactory("vc-customRPC-settings-");

const makeValidator = (maxLength: number, isRequired = false) => (value: string) => {
    if (isRequired && !value) return "This field is required.";
    if (value.length > maxLength) return `Must be not longer than ${maxLength} characters.`;
    return true;
};

function isStreamLinkValid(value: string, type: ActivityType | undefined) {
    if (type === ActivityType.STREAMING && value && !/https?:\/\/(www\.)?(twitch\.tv|youtube\.com)\/\w+/.test(value))
        return "Must be a valid Twitch or YouTube URL.";
    if (value && value.length > 512) return "Must be not longer than 512 characters.";
    return true;
}

function isNumberValid(value: number) {
    if (isNaN(value)) return "Must be a number.";
    if (value < 0) return "Must be a positive number.";
    return true;
}

function isUrlValid(value: string) {
    if (value && !/^https?:\/\/.+/.test(value)) return "Must be a valid URL.";
    return true;
}

function isImageKeyValid(value: string) {
    if (/https?:\/\/(cdn|media)\.discordapp\.(com|net)\//.test(value)) return "Don't use a Discord link. Use an Imgur image link instead.";
    if (/https?:\/\/(?!i\.)?imgur\.com\//.test(value)) return "Imgur link must be a direct link (e.g. https://i.imgur.com/...).";
    if (/https?:\/\/(?!media\.)?tenor\.com\//.test(value)) return "Tenor link must be a direct link (e.g. https://media.tenor.com/...).";
    return true;
}

type FieldProps = { label: string; disabled?: boolean; } & ({
    type?: "text";
    initialValue?: string;
    onChange: (value: string) => void;
    isValid?: (value: string) => true | string;
    placeholder?: string;
} | {
    type: "number";
    initialValue?: number;
    onChange: (value: number) => void;
});

function Field(props: FieldProps) {
    const isNumber = props.type === "number";

    const [state, setState] = useState(isNumber ? (props.initialValue != null ? String(props.initialValue) : "") : (props.initialValue ?? ""));
    const [error, setError] = useState<string | null>(null);

    function handleChange(newValue: string) {
        if (isNumber) {
            const valid = newValue ? isNumberValid(parseInt(newValue, 10)) : true;
            setState(newValue);
            setError(resolveError(valid));
        } else {
            const valid = props.isValid?.(newValue) ?? true;
            setState(newValue);
            setError(resolveError(valid));
        }
    }

    function handleBlur() {
        if (error) return;
        if (isNumber) {
            const parsed = state ? parseInt(state, 10) : 0;
            if (!isNaN(parsed) && parsed >= 0)
                props.onChange(parsed);
        } else {
            if ((props.isValid?.(state) ?? true) === true) props.onChange(state);
        }
    }

    return (
        <TextInput
            type="text"
            label={props.label}
            placeholder={isNumber ? "0" : props.placeholder ?? "Enter a value"}
            value={state}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={props.disabled}
            error={error ?? undefined}
        />
    );
}

function PresetCard({ preset, isActive, onDelete }: { preset: RPCPreset; isActive: boolean; onDelete: () => void; }) {
    const isStreaming = preset.type === ActivityType.STREAMING;
    const isPlaying = preset.type == null || preset.type === ActivityType.PLAYING;
    const isCustomTs = preset.timestampMode === TimestampMode.CUSTOM;

    function update<K extends keyof RPCPreset>(key: K, value: RPCPreset[K]) {
        const p = settings.store.presets?.find(p => p.name === preset.name);
        if (p) p[key] = value;
        if (isActive) setRpc();
    }

    function saveNameOnBlur(newName: string) {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === preset.name) return;
        const raw = settings.plain.presets ?? [];
        if (raw.some(p => p.name === trimmed && p.name !== preset.name)) return;
        if (isActive) settings.store.activePreset = trimmed;
        settings.store.presets = raw.map(p =>
            p.name === preset.name ? { ...p, name: trimmed } : p
        );
    }

    return (
        <ExpandableCard
            buttons={[{ icon: Icons.TrashIcon, onClick: onDelete }]}
            render={() => (
                <div className={cl("body")}>
                    <TextInput defaultValue={preset.name} onBlur={e => saveNameOnBlur(e.currentTarget.value)} label="Preset Name" placeholder="Example: Infinite Minecraft Time Played" spellCheck={false} />

                    <Forms.FormDivider gap={8} />

                    <Select
                        label="Activity Type"
                        placeholder="Select an option"
                        options={[
                            { label: "Playing", value: ActivityType.PLAYING },
                            { label: "Streaming", value: ActivityType.STREAMING },
                            { label: "Listening", value: ActivityType.LISTENING },
                            { label: "Watching", value: ActivityType.WATCHING },
                            { label: "Competing", value: ActivityType.COMPETING }
                        ]}
                        onSelectionChange={v => update("type", v)}
                        value={preset.type ?? ActivityType.PLAYING}
                        formatOption={option => ({
                            ...option,
                            id: option.value
                        })}
                    />

                    <div className={cl("pair")}>
                        <Field label="Application ID" initialValue={preset.appID} onChange={v => update("appID", v)} isValid={value => {
                            if (value && value !== "1" && !SnowflakeUtils.isProbablyAValidSnowflake(value)) return "Must be a valid Discord ID."; return true;
                        }} />
                        <Field label="Application Name" initialValue={preset.appName} onChange={v => update("appName", v)} isValid={makeValidator(128, true)} />
                    </div>

                    <div className={cl("pair")}>
                        <Field label="Detail (line 1)" initialValue={preset.details} onChange={v => update("details", v)} isValid={makeValidator(128)} />
                        <Field label="Detail URL" initialValue={preset.detailsURL} onChange={v => update("detailsURL", v)} isValid={isUrlValid} />
                    </div>

                    <div className={cl("pair")}>
                        <Field label="State (line 2)" initialValue={preset.state} onChange={v => update("state", v)} isValid={makeValidator(128)} />
                        <Field label="State URL" initialValue={preset.stateURL} onChange={v => update("stateURL", v)} isValid={isUrlValid} />
                    </div>

                    <Field
                        label="Stream Link (Twitch or YouTube)"
                        initialValue={preset.streamLink}
                        onChange={v => update("streamLink", v)}
                        isValid={v => isStreamLinkValid(v, preset.type)}
                        disabled={!isStreaming}
                    />

                    <div className={cl("pair")}>
                        <Field type="number" label="Party Size" initialValue={preset.partySize} onChange={v => update("partySize", v)} disabled={!isPlaying} />
                        <Field type="number" label="Maximum Party Size" initialValue={preset.partyMaxSize} onChange={v => update("partyMaxSize", v)} disabled={!isPlaying} />
                    </div>

                    <Forms.FormDivider />

                    <div className={cl("pair")}>
                        <Field label="Large Image URL/Key" initialValue={preset.imageBig} onChange={v => update("imageBig", v)} isValid={isImageKeyValid} />
                        <Field label="Large Image Text" initialValue={preset.imageBigTooltip} onChange={v => update("imageBigTooltip", v)} isValid={makeValidator(128)} />
                    </div>
                    <Field label="Large Image clickable URL" initialValue={preset.imageBigURL} onChange={v => update("imageBigURL", v)} isValid={isUrlValid} />

                    <div className={cl("pair")}>
                        <Field label="Small Image URL/Key" initialValue={preset.imageSmall} onChange={v => update("imageSmall", v)} isValid={isImageKeyValid} />
                        <Field label="Small Image Text" initialValue={preset.imageSmallTooltip} onChange={v => update("imageSmallTooltip", v)} isValid={makeValidator(128)} />
                    </div>
                    <Field label="Small Image clickable URL" initialValue={preset.imageSmallURL} onChange={v => update("imageSmallURL", v)} isValid={isUrlValid} />

                    <Forms.FormDivider />

                    <div className={cl("pair")}>
                        <Field label="Button 1 Text" initialValue={preset.buttonOneText} onChange={v => update("buttonOneText", v)} isValid={makeValidator(31)} />
                        <Field label="Button 1 URL" initialValue={preset.buttonOneURL} onChange={v => update("buttonOneURL", v)} isValid={isUrlValid} />
                    </div>
                    <div className={cl("pair")}>
                        <Field label="Button 2 Text" initialValue={preset.buttonTwoText} onChange={v => update("buttonTwoText", v)} isValid={makeValidator(31)} />
                        <Field label="Button 2 URL" initialValue={preset.buttonTwoURL} onChange={v => update("buttonTwoURL", v)} isValid={isUrlValid} />
                    </div>

                    <Forms.FormDivider />

                    <Select
                        label="Timestamp Mode"
                        placeholder="Select an option"
                        options={[
                            { label: "None", value: TimestampMode.NONE },
                            { label: "Since discord open", value: TimestampMode.NOW },
                            { label: "Same as your current time", value: TimestampMode.TIME },
                            { label: "Custom", value: TimestampMode.CUSTOM }
                        ]}
                        onSelectionChange={v => update("timestampMode", v)}
                        value={preset.timestampMode ?? TimestampMode.NONE}
                        formatOption={option => ({
                            ...option,
                            id: option.value
                        })}
                    />
                    <div className={cl("pair")}>
                        <Field type="number" label="Start Timestamp (ms)" initialValue={preset.startTime} onChange={v => update("startTime", v)} disabled={!isCustomTs} />
                        <Field type="number" label="End Timestamp (ms)" initialValue={preset.endTime} onChange={v => update("endTime", v)} disabled={!isCustomTs} />
                    </div>
                </div>
            )}
        >
            <div>
                <Text variant="text-md/semibold">{preset.name}</Text>
                {preset.appName && <Text variant="text-sm/normal" color="text-muted">{preset.appName}</Text>}
            </div>
        </ExpandableCard>
    );
}

export function RPCSettings() {
    const s = settings.use();
    const [newName, setNewName] = useState("");

    const presets = s.presets || [];

    function savePreset() {
        const raw = settings.plain.presets ?? [];
        let name = newName.trim();
        if (!name) {
            let i = raw.length + 1;
            while (raw.some(p => p.name === `Preset ${i}`)) i++;
            name = `Preset ${i}`;
        }
        if (raw.some(p => p.name === name)) return;
        settings.store.presets = [...raw, { name }];
        setNewName("");
    }

    function deletePreset(name: string) {
        const raw = settings.plain.presets ?? [];
        settings.store.presets = raw.filter(p => p.name !== name);
        if (settings.plain.activePreset === name) {
            settings.store.activePreset = undefined;
            setRpc(true);
        }
    }

    return (
        <section className={cl("section")}>
            {presets.length > 0 && <>
                <Forms.FormTitle tag="h4">Controls</Forms.FormTitle>

                <Select
                    placeholder="Select active preset RPC..."
                    options={presets.map(p => ({ value: p.name, label: p.name }))}
                    onSelectionChange={v => { settings.store.activePreset = v; setRpc(); }}
                    value={s.activePreset}
                    formatOption={option => ({
                        ...option,
                        id: option.value
                    })}
                />
            </>}
            <Forms.FormTitle tag="h4">Presets</Forms.FormTitle>

            <div className={cl("save-row")}>
                <TextInput size="sm" value={newName} onChange={setNewName} placeholder="Preset name (optional)" />
                <Buttons.Button size="sm" text="Create" variant="secondary" onClick={savePreset} />
            </div>

            {presets.length === 0 ? (
                <Text variant="text-sm/normal" className={cl("empty")}>
                    No presets yet. Create one above to get started.
                </Text>
            ) : (
                <div className={cl("list")}>
                    {presets.map((preset, i) => (
                        <PresetCard
                            key={i}
                            preset={preset}
                            isActive={preset.name === s.activePreset}
                            onDelete={() => deletePreset(preset.name)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
