/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 Velocitcs and contributors
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

export default definePlugin({
    name: "NoSendWarnings",
    description: "Removes the 'HOLD UP!' warnings before sending a discord token or @everyone",
    tags: ["Utility", "Chat", "Shortcuts"],
    authors: [Devs.RoScripter999],

    patches: [
        {
            find: "@Everyone",
            replacement: {
                match: /(let \w+)=\[[\s\S]+?\}\]/,
                replace: "$1=[]"
            }
        }
    ]
});
