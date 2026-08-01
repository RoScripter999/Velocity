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

import { classNameFactory } from "@utils/css";

const ZW0 = "\u200B";
const ZW1 = "\u200C";
const MARKER = "\u2060";

export function encodeCommand(id: string, options?: Record<string, any>): string {
    const hasOptions = options && Object.keys(options).length > 0;
    const payload = hasOptions ? `${id}\x00${encodeURIComponent(JSON.stringify(options))}` : id;
    const bits = Array.from(payload).flatMap(c =>
        c.charCodeAt(0).toString(2).padStart(7, "0").split("").map(b => b === "0" ? ZW0 : ZW1)
    );
    return MARKER + bits.join("") + MARKER;
}

export function decodeCommand(text: string): { id: string; options: Record<string, any>; } | null {
    const match = text.match(/⁠([​‌]+)⁠/);
    if (!match) return null;
    const bits = Array.from(match[1]).map(c => c === ZW1 ? "1" : "0");
    if (bits.length % 7 !== 0) return null;
    let payload = "";
    for (let i = 0; i < bits.length; i += 7)
        payload += String.fromCharCode(parseInt(bits.slice(i, i + 7).join(""), 2));
    const sep = payload.indexOf("\x00");
    if (sep === -1) return { id: payload, options: {} };
    try {
        return { id: payload.slice(0, sep), options: JSON.parse(decodeURIComponent(payload.slice(sep + 1))) };
    } catch {
        return { id: payload.slice(0, sep), options: {} };
    }
}

export const cl = classNameFactory("vc-cu-");

export enum Categories {
    VOICE = "Voice",
    CHAT = "Chat",
    USER = "User",
    SYSTEM = "System"
}
