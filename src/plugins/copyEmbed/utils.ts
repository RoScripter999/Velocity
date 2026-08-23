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

import { copyWithToast } from "@utils/discord";
import type { Embed, EmbedJSON, Message } from "@velocity-types";

export enum CopyType {
    EMBED,
    DESCRIPTION
}

// Discord has a simular function, but i couldn't find one that reverses the color
function parseDiscordColor(colorValue: string | number): number | null {
    if (typeof colorValue === "number") return colorValue;
    if (typeof colorValue === "string") {
        if (colorValue.startsWith("#")) return parseInt(colorValue.slice(1), 16);
        const hexMatch = colorValue.match(/^[0-9A-Fa-f]{6}$/);
        if (hexMatch) return parseInt(colorValue, 16);

        const hslMatch = colorValue.match(/hsla?\((\d+),.*?(\d+(?:\.\d+)?)%.*?(\d+(?:\.\d+)?)%/);
        if (hslMatch) {
            const h = parseInt(hslMatch[1]) / 360;
            const s = parseFloat(hslMatch[2]) / 100;
            const l = parseFloat(hslMatch[3]) / 100;
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
            const g = Math.round(hue2rgb(p, q, h) * 255);
            const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
            return (r << 16) + (g << 8) + b;
        }
    }
    return null;
}

export function toEmbedJson(embed: Embed): EmbedJSON {
    const e: EmbedJSON = {};

    if (embed.rawTitle) e.title = embed.rawTitle;
    if (embed.rawDescription) e.description = embed.rawDescription;
    if (embed.url) e.url = embed.url;
    if (embed.color) {
        const parsedColor = parseDiscordColor(embed.color);
        if (parsedColor !== null) e.color = parsedColor.toString();
    }
    if (embed.timestamp) e.timestamp = embed.timestamp.toString();

    if (embed.footer) {
        e.footer = {};
        if (embed.footer.text) e.footer.text = embed.footer.text;
        if (embed.footer.iconURL) e.footer.icon_url = embed.footer.iconURL;
    }

    if (embed.author) {
        e.author = {};
        if (embed.author.name) e.author.name = embed.author.name;
        if (embed.author.url) e.author.url = embed.author.url;
        if (embed.author.iconURL) e.author.icon_url = embed.author.iconURL;
    }

    if (embed.thumbnail) e.thumbnail = { height: embed.thumbnail.height, width: embed.thumbnail.width, url: embed.thumbnail.url, proxy_url: embed.thumbnail.proxyURL };
    if (embed.image) e.image = { height: embed.image.height, width: embed.image.width, url: embed.image.url, proxy_url: embed.image.proxyURL };
    if (embed.fields?.length) {
        e.fields = embed.fields.map(f => ({
            name: f.rawName,
            value: f.rawValue,
            inline: f.inline
        }));
    }

    return e;
}

export function copyEmbedContent(msg: Message, type: CopyType, embedIndex: number = 0) {
    if (!msg?.embeds?.length) return;

    const embed = msg.embeds[embedIndex];
    if (!embed) return;

    switch (type) {
        case CopyType.EMBED:
            const cleanEmbeds = msg.embeds.map(toEmbedJson);
            copyWithToast(JSON.stringify({ content: null, embeds: cleanEmbeds, attachments: [] }, null, 2), "Embed JSON copied!");
            break;
        case CopyType.DESCRIPTION:
            copyWithToast(embed.rawDescription, `Embed ${embedIndex + 1} description copied!`);
            break;
    }
}
