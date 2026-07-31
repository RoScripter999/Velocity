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

import { Paragraph } from "@components/Paragraph";
import { SearchableSelect, useMemo, useState } from "@webpack/common";

import { getCurrentVoice, settings } from "./settings";

// TODO: replace by [Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy) once it has more maturity

function groupBy<T extends object, K extends PropertyKey>(arr: T[], fn: (obj: T) => K) {
    return arr.reduce((acc, obj) => {
        const value = fn(obj);
        acc[value] ??= [];
        acc[value].push(obj);
        return acc;
    }, {} as Record<K, T[]>);
}

interface PickerProps {
    voice: string | undefined;
    voices: SpeechSynthesisVoice[];
}

function SimplePicker({ voice, voices }: PickerProps) {
    const options = voices.map(voice => ({
        label: voice.name,
        value: voice.voiceURI,
        id: voice.voiceURI
    }));

    return (
        <SearchableSelect
            label="Voice"
            placeholder="Select a voice"
            selectionMode="single"
            options={options}
            value={options.find(o => o.value === voice)}
            onSelectionChange={v => settings.store.voice = v}
        />
    );
}

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });

function ComplexPicker({ voice, voices }: PickerProps) {
    const groupedVoices = useMemo(() => groupBy(voices, voice => voice.lang), [voices]);

    const languageNameMapping = useMemo(() => {
        const list = [] as Record<"name" | "friendlyName", string>[];

        for (const name in groupedVoices) {
            try {
                const friendlyName = languageNames.of(name);
                if (friendlyName) {
                    list.push({ name, friendlyName });
                }
            } catch { }
        }

        return list;
    }, [groupedVoices]);

    const [selectedLanguage, setSelectedLanguage] = useState(() => getCurrentVoice()?.lang ?? languageNameMapping[0].name);

    if (languageNameMapping.length === 1) {
        return (
            <SimplePicker
                voice={voice}
                voices={groupedVoices[languageNameMapping[0].name]}
            />
        );
    }

    const voicesForLanguage = groupedVoices[selectedLanguage];

    const languageOptions = languageNameMapping.map(l => ({
        label: l.friendlyName,
        id: l.name,
        value: l.name
    }));

    return (
        <>
            <SearchableSelect
                label="Language"
                placeholder="Select a language"
                options={languageOptions}
                value={languageOptions.find(l => l.value === selectedLanguage)}
                onSelectionChange={setSelectedLanguage}
            />
            <SimplePicker
                voice={voice}
                voices={voicesForLanguage}
            />
        </>
    );
}


function VoiceSetting() {
    const voices = useMemo(() => window.speechSynthesis?.getVoices() ?? [], []);
    const { voice } = settings.use(["voice"]);

    if (!voices.length)
        return <Paragraph>No voices found.</Paragraph>;

    // espeak on Linux has a ridiculous amount of voices (26k for me).
    // If there are more than 20 voices, we split it up into two pickers, one for language, then one with only the voices for that language.
    // This way, there are around 200-ish options per language
    const Picker = voices.length > 20 ? ComplexPicker : SimplePicker;
    return <Picker voice={voice} voices={voices} />;
}

export function VoiceSettingSection() {
    return (
        <section>
            <VoiceSetting />
        </section>
    );
}
