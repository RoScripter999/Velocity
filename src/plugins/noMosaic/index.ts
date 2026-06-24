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
    inlineVideo: {
        description: "Play videos without carousel modal",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    }
});

export default definePlugin({
    name: "NoMosaic",
    authors: [Devs.AutumnVN],
    description: "Removes Discord image mosaic",
    tags: ["Media", "Appearance", "Chat"],
    searchTerms: ["image", "mosaic", "media"],

    settings,

    patches: [
        {
            find: '"PLAINTEXT_PREVIEW":"OTHER"',
            replacement: {
                match: /"return IMAGE"===\i\|\|"VIDEO"===\i\|\|"CLIP"===\i/,
                replace: "return false"
            }
        },
        {
            find: "return{visualMediaItems:",
            replacement: {
                match: /return{visualMediaItems:.+?props:(\i)(?=.{0,20}?\1\.item\.uniqueId)/,
                replace: '$&,useFullWidth:["IMAGE","VIDEO","CLIP"].includes($1.item?.type)?false:undefined'
            }
        },
        {
            find: "renderAttachments(",
            predicate: () => settings.store.inlineVideo,
            replacement: {
                match: /url:(\i)\.url\}\);return /,
                replace: "$&$1.content_type?.startsWith('image/')&&"
            }
        }
    ]
});
