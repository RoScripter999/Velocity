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
import { Logger } from "@utils/Logger";
import definePlugin, { StartAt } from "@utils/types";

let observer: MutationObserver | null;

function cleanSheet(sheet: CSSStyleSheet) {
    try {
        const rules = sheet.cssRules;
        if (!rules) return;

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];

            if ((rule as CSSStyleRule).selectorText?.includes(":has(.gameOption_")) {
                new Logger("FixDiscordCss").info("Removed problematic CSS rule", rule.cssText);
                sheet.deleteRule(i);
                observer!.disconnect();
                observer = null;
                break;
            }
        }
    } catch (e) { }
}

function handleNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE || !(node as HTMLElement).matches('link[rel="stylesheet"]')) return;

    const linkNode = node as HTMLLinkElement;

    if (linkNode.sheet) {
        cleanSheet(linkNode.sheet);
    } else {
        node.addEventListener("load", () => cleanSheet(linkNode.sheet!), { once: true });
    }
}

export default definePlugin({
    name: "FixDiscordCss",
    description: "Fixes Discord's css lag",
    authors: [Devs.Ven],
    required: true,

    startAt: StartAt.DOMContentLoaded,

    start() {
        observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                m.addedNodes.forEach(handleNode);
            }
        });
        observer.observe(document.head, { childList: true });
    }
});
