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

import type { IpcMainInvokeEvent } from "electron";

interface fetchProps {
    author: string;
    current_vote: string;
    defid: number;
    definition: string;
    example: string;
    permalink: string;

    thumbs_down: number;
    thumbs_up: number;

    word: string;
    written_on: string | Date;
}

interface DictionaryResponse {
    list: fetchProps[];
}

export async function makeDictionaryReq(_: IpcMainInvokeEvent, word: fetchProps["word"]) {
    const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await res.json() as DictionaryResponse;
        return { status: res.status, data };
    } catch (e) {
        return { status: -1, data: { list: [] } as DictionaryResponse };
    }
}
