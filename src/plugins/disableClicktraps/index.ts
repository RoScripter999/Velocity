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

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "DisableClicktraps",
    description: "Disables the clicktraps on modals and most of stuff",
    tags: ["Shortcuts", "Accessibility"],
    authors: [Devs.RoScripter999],

    patches: [
        // for some reason it doesnt use the clicktrap module in the other patch.
        {
            find: 'left,"Missing left"',
            replacement: {
                // TODO: make this a stable compat, although it wasn't been changed for months now.
                match: /clickTrap:(\w+)=!1([\s\S]*?\[\w+\.\w+\]:)\1/,
                replace: "clickTrap:$1=!1$2!1"
            }
        },
        // We prevent focus trapping by defaulting the target to null.
        // making modules not capture the focus, which makes this module completely unusable
        {
            find: ".current?.ownerDocument??document,[",
            replacement: {
                match: /=(\w+)\.disable\?(\w+):\w+/,
                replace: "=$2"
            }
        }
    ]
});
