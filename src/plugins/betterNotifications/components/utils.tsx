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

import type { SoundEntry } from "../settings";

export const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export const getEntryDisplay = (entry: SoundEntry, isUserTab: boolean) => {
    if (isUserTab) {
        return entry.userLabel || (entry.userId ? entry.displayName || entry.userId : entry.displayName);
    }
    return entry.guildName || entry.guildId;
};

export const getEntrySubtext = (entry: SoundEntry, isUserTab: boolean) => {
    if (isUserTab) {
        return entry.userId ? `User ID: ${entry.userId}` : `Display Name: ${entry.displayName}`;
    }
    return entry.guildName ? `User ID: ${entry.guildId}` : "";
};

export const makeEmptyForm = () => ({ id: "", name: "", note: "", soundUrl: "", filename: "", volume: 0.5, displayNameMode: false, error: false });
