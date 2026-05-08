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

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { sleep } from "@utils/misc";
import definePlugin, { makeRange, OptionType } from "@utils/types";
import { WindowStore } from "@webpack/common";

const SOUND_URL = "https://raw.githubusercontent.com/MeguminSama/VencordPlugins/main/plugins/moyai/moyai.mp3";

const settings = definePluginSettings({
    volume: {
        description: "Volume of the 🗿",
        type: OptionType.SLIDER,
        markers: makeRange(0, 1, 0.1),
        default: 0.5
    },
    triggerWhenUnfocused: {
        description: "Trigger even when Discord is unfocused",
        type: OptionType.BOOLEAN,
        default: true
    },
    ignoreBots: {
        description: "Don't trigger on bot messages",
        type: OptionType.BOOLEAN,
        default: true
    },
    cooldown: {
        description: "Delay between each moyai sound (ms)",
        type: OptionType.SLIDER,
        markers: makeRange(100, 1000, 100),
        default: 300
    }
});

function getMoyaiCount(message: string): number {
    let count = 0;
    let pos = 0;

    while ((pos = message.indexOf("🗿", pos)) !== -1) {
        count++;
        pos++;
    }

    const customMatches = message.match(/<a?:\w*moy?ai\w*:\d{17,20}>/gi);
    if (customMatches) count += customMatches.length;

    return Math.min(count, 10);
}

async function playMoyai() {
    if (!settings.store.triggerWhenUnfocused && !WindowStore.isAppFocused()) return;

    const audio = document.createElement("audio");
    audio.src = SOUND_URL;

    const baseVolume = settings.store.volume;
    audio.volume = Math.min(baseVolume);

    audio.play().catch(() => { });
}

export default definePlugin({
    name: "Moyai",
    description: "It's just 🗿🗿🗿",
    tags: ["Fun", "Friends"],
    authors: [Devs.Veny],
    settings,

    flux: {
        MESSAGE_CREATE: async e => {
            if (settings.store.ignoreBots && e.message.author?.bot) return;
            if (!e.message.content) return;

            const count = getMoyaiCount(e.message.content);

            for (let i = 0; i < count; i++) {
                await playMoyai();
                await sleep(settings.store.cooldown);
            }
        }
    }
});
