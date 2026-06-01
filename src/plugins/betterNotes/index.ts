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

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    hide: {
        type: OptionType.BOOLEAN,
        description: "Hide notes",
        default: false,
        restartNeeded: true
    },
    noSpellCheck: {
        type: OptionType.BOOLEAN,
        description: "Disable spellcheck in notes",
        disabled: () => settings.store.hide,
        default: false
    }
});

export default definePlugin({
    name: "BetterNotesBox",
    description: "Hide notes or disable spellcheck (Configure in settings!!)",
    authors: [Devs.Ven],
    tags: ["Customisation", "Utility"],
    settings,

    patches: [
        {
            find: "#{intl::LOADING_NOTE}",
            predicate: () => settings.store.hide,
            lazy: true,
            replacement: {
                match: /\.hidePersonalInformation/,
                replace: ""
            }
        },

        {
            find: "#{intl::NOTE_PLACEHOLDER}",
            predicate: () => !settings.store.hide && settings.store.noSpellCheck,
            lazy: true,
            replacement: {
                match: /#{intl::NOTE_PLACEHOLDER}\),/,
                replace: "$&spellCheck:!$self.noSpellCheck,"
            }
        }
    ],

    get noSpellCheck() {
        return settings.store.noSpellCheck;
    }
});
