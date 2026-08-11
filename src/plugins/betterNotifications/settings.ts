/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 RoScripter999 and contributors
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

import { DataStore } from "@api/index";
import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { SoundSettings } from "./components/SoundSettings";

const KEY = "BetterNotifications_soundEntries";

export interface SoundEntry {
    id: string;
    type: "user" | "guild";
    userId: string;
    displayName?: string;
    userLabel?: string;
    guildId: string;
    guildName?: string;
    soundUrl: string;
    filename?: string;
    volume: number;
}

export interface SoundData {
    soundUrl: string;
    volume: number;
}

export const settings = definePluginSettings({
    soundSettings: {
        type: OptionType.COMPONENT,
        default: [],
        component: SoundSettings
    },
    preventOverlap: {
        type: OptionType.BOOLEAN,
        description: "Prevents notifications from overlapping",
        default: false
    }
});

let cachedEntries: SoundEntry[] | null = null;

export function getSoundEntries(): SoundEntry[] {
    return cachedEntries ?? [];
}

export async function loadSoundEntries(): Promise<void> {
    cachedEntries = (await DataStore.get<SoundEntry[]>(KEY)) ?? [];
}

export function saveSoundEntries(entries: SoundEntry[]): void {
    cachedEntries = entries;
    DataStore.set(KEY, entries);
}

export function buildSoundMap(entries: SoundEntry[]) {
    const userSounds: Record<string, SoundData> = {};
    const guildSounds: Record<string, SoundData> = {};

    for (const entry of entries) {
        const sound = { soundUrl: entry.soundUrl, volume: entry.volume };
        if (entry.type === "user" && entry.userId) userSounds[entry.userId] = sound;
        else if (entry.type === "guild" && entry.guildId) guildSounds[entry.guildId] = sound;
    }

    return { userSounds, guildSounds };
}
