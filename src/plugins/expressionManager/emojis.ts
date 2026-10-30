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

import type { Message } from "@velocity-types";
import { findByCodeLazy } from "@webpack";
import { EmojiStore, SelectedGuildStore, showToast } from "@webpack/common";

import { buildCloneItem, logger } from ".";

interface Emoji {
    id: string;
    name: string;
}

const openEmojiStudioModal = findByCodeLazy("Emoji Studio");

export const EmojiURLRegex = /^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.\w+/;

export const formatEmojiURL = (emoji: Emoji, size: number) => `${location.protocol}//${window.GLOBAL_ENV.CDN_HOST}/emojis/${emoji.id}.webp?size=${size}&lossless=true&animated=true`;

export const buildCloneEmojiItem = (emoji: Emoji) =>
    buildCloneItem("Emoji", () => openEmojiUploadModal(formatEmojiURL(emoji, 128), emoji.name));

export const editEmoji = (emoji: Emoji, guildId: string) =>
    openEmojiStudioModal({
        analyticsLocation: "guild settings edit emoji",
        emoji,
        guildId
    });

export async function openEmojiUploadModal(url: string, filename?: string) {
    try {
        filename ||= new URL(url).pathname.split("/").pop() ?? "emoji.png";

        const blob = await fetch(url).then(res => res.blob());

        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject("Failed to read blob as data URL");
            reader.readAsDataURL(blob);
        });

        const image = new Image();
        image.src = dataUrl;
        await image.decode();

        const file = new File([blob], filename, { type: blob.type });

        await openEmojiStudioModal({
            analyticsLocation: {
                page: "Guild Settings"
            },
            guildId: SelectedGuildStore.getGuildId(),
            userImage: {
                image,
                file,
                data: dataUrl
            }
        });
    } catch (e) {
        logger.error("Failed to open Emoji Modal", e);
        showToast({ text: `Failed to open Emoji Modal: ${e}`, variant: "critical" });
    }
}

export function resolveEmojiName(id: string, message: Message) {
    const emoji = EmojiStore.getCustomEmojiById(id);
    if (emoji) return emoji.name;

    const reaction = "reactions" in message && message.reactions.find(reaction => reaction.emoji.id === id);
    if (reaction) return reaction.emoji.name;

    const match = message.content.match(RegExp(`<a?:(\\w+)(?:~\\d+)?:${id}>|https://cdn\\.discordapp\\.com/emojis/${id}\\.[\\w?&=%]*`));
    if (!match) return null;

    return match[1]
        ?? URL.parse(match[0])?.searchParams.get("name")
        ?? "FakeNitroEmoji";
}
