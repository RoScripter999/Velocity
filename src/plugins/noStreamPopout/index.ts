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
    hideMode: {
        description: "When to hide the stream popout",
        type: OptionType.SELECT,
        options: [
            { label: "Always (all streams)", value: "all", default: true },
            { label: "Only my own stream", value: "ownStream" }
        ]
    },
    hidePopoutButton: {
        description: "Hide the 'Pop out' button on others' streams",
        type: OptionType.BOOLEAN,
        default: false
    }
});

export default definePlugin({
    name: "NoStreamPopout",
    description: "Removes the streaming popout, either always or only for your own stream",
    tags: ["Organisation", "Appearance", "Voice"],
    authors: [Devs.RoScripter999],
    settings,

    patches: [
        {
            find: "#{intl::OPEN_IN_THEATER}",
            replacement: {
                match: /return\s*\(\s*\d+\s*,\s*\w+\.jsxs\)\(\s*"[^"]+"\s*,\s*\{/,
                replace: "if($self.hideAll)return null;$&"
            }
        },
        {
            find: "Cannot render settings for non stream participant",
            replacement: [
                {
                    match: /render\(\)\{let\{channel:/,
                    replace: "render(){if($self.hideOwnStream&&this?.viewProperties?.isSelf===true)return null;let{channel:"
                },
                {
                    match: /(?<=renderPopoutIcon=\(\)=>)/,
                    replace: "$self.hidePopoutButton?null:"
                }
            ]
        }
    ],

    get hideAll() { return settings.store.hideMode === "all"; },
    get hideOwnStream() { return settings.store.hideMode === "ownStream"; },
    get hidePopoutButton() { return settings.store.hidePopoutButton; }
});
