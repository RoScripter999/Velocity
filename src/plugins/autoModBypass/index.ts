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

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

const EmojiRe = /<a?:[a-zA-Z0-9_]+:\d{17,20}>/g;
const SkipRe = /(https?:\/\/[^\s]+|www\.[^\s]+|@everyone|@here)/gi;

type Range = { start: number; end: number; };

function transformMessage(text: string): string {
    const skipped: Range[] = [];

    for (const m of text.matchAll(EmojiRe))
        skipped.push({ start: m.index!, end: m.index! + m[0].length });

    for (const m of text.matchAll(SkipRe)) {
        const start = m.index!;
        const end = start + m[0].length;
        if (!skipped.some(r => start < r.end && end > r.start))
            skipped.push({ start, end });
    }

    skipped.sort((a, b) => a.start - b.start);

    const homoglyphs = {
        "a": "\u0430", "c": "\u0441", "e": "\u0435", "o": "\u043e", "p": "\u0440", "x": "\u0445", "y": "\u0443"
    };

    const bypassText = (str: string) => {
        return str.split("").map(char => {
            const lower = char.toLowerCase();
            const replacement = homoglyphs[lower];

            if (!replacement) return char;

            return char === char.toUpperCase() ? replacement.toUpperCase() : replacement;
        }).join("");
    };

    const parts: string[] = [];
    let cursor = 0;

    for (const { start, end } of skipped) {
        if (start > cursor)
            parts.push(bypassText(text.slice(cursor, start)));
        parts.push(text.slice(start, end));
        cursor = end;
    }

    if (cursor < text.length)
        parts.push(bypassText(text.slice(cursor)));

    return parts.join("");
}


export default definePlugin({
    name: "AutoModBypass",
    description: "Bypasses the Discord automod with cool injection stuff.",
    authors: [Devs.RoScripter999],
    tags: ["Chat", "Fun", "Servers"],

    onBeforeMessageSend(_, message, _options, props) {
        if (!message.content) return;

        const channel = props.channel;
        if (channel.isDM() || channel.isGroupDM()) return;

        const content = message.content;
        if (/^`[^`]/.test(content) || content.startsWith("```")) return;

        message.content = transformMessage(content);
    }
});
