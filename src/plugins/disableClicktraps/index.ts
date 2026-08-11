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

import { managedStyleRootNode } from "@api/Styles";
import { Devs } from "@utils/constants";
import { createAndAppendStyle } from "@utils/css";
import definePlugin from "@utils/types";
import { findCssClassesLazy } from "@webpack";

let style: HTMLStyleElement;

const TitleBarClasses = findCssClassesLazy("show", "systemBar");

function clickTrapCss() {
    style.textContent = `
        .${TitleBarClasses.show} {
            display: none;
            flex: unset;
        }

        .carouselModal_d3a6f0 {
            pointer-events: none !important;
        }

        .carouselModal_d3a6f0 * {
            pointer-events: auto !important;
        }
        `;
}

export default definePlugin({
    name: "DisableClicktraps",
    description: "Disables the clicktraps that block clicks (modals, menus etc..)",
    tags: ["Shortcuts", "Accessibility"],
    authors: [Devs.RoScripter999],


    start() {
        style = createAndAppendStyle("VcDisableClicktraps", managedStyleRootNode);

        clickTrapCss();
    },

    stop() {
        style?.remove();
    },

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
        {
            // Remove another weird feature discord is adding for popouts
            find: '"--floating-ui-scrollbar-width"',
            replacement: {
                match: /\(0,\i\.\i\)\("div",\{ref:\i,\.\.\.\i,style:\{position:"fixed".{0,60}\}\}\)/,
                replace: "null"
            }
        },
        {
            find: '"scrim":"empty"',
            replacement: {
                match: /let\s*\{\s*variant[^}]*onClick[^}]*\}\s*=\s*\w+/,
                replace: "return null;"
            }
        },
        // We prevent focus trapping by removing the disable check
        // making modules not capture the focus, which makes this module completely unusable
        {
            find: ".attachTo??",
            replacement: {
                match: /(return \i\()\i\.disable\?(\i):\i,/,
                replace: "$1$2,"
            }
        }
    ]
});
