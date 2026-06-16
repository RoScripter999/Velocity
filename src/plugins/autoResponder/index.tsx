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

import { Devs } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";
import { UserStore } from "@webpack/common";

import { type Rule, settings, stringToRegex } from "./settings";

const logger = new Logger("AutoResponder");
const processedMessages = new Set<string>();
const ruleLastResponseTimes = new Map<string, number>();
let lastResponseTime = 0;

function matchStringRule(rule: Rule, content: string): boolean {
    let checkContent = content;
    let checkTrigger = rule.trigger;

    if (!rule.caseSensitive) {
        checkContent = checkContent.toLowerCase();
        checkTrigger = checkTrigger.toLowerCase();
    }

    if (rule.matchWholeWord) {
        const regex = new RegExp(
            `\\b${checkTrigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            rule.caseSensitive ? "" : "i"
        );
        return regex.test(content);
    }

    return checkContent.includes(checkTrigger);
}

function matchRegexRule(rule: Rule, content: string): boolean {
    try {
        return stringToRegex(rule.trigger).test(content);
    } catch (e) {
        logger.error(`Invalid regex: ${rule.trigger}`);
        return false;
    }
}

function tryMatch(
    content: string,
    messageId: string,
    rules: Rule[],
    prefix: string,
    matcher: (rule: Rule, content: string) => boolean
): { response: string; delay: number; } | null {
    const now = Date.now();

    for (const rule of rules) {
        if (!rule.trigger || !rule.response) continue;
        if (rule.onlyIfIncludes && !content.includes(rule.onlyIfIncludes)) continue;

        const key = `${prefix}:${rule.trigger}`;
        if (now - (ruleLastResponseTimes.get(key) ?? 0) < (rule.responseCooldown ?? 0) * 1000) continue;

        if (!matcher(rule, content)) continue;

        processedMessages.add(messageId);
        lastResponseTime = now;
        ruleLastResponseTimes.set(key, now);
        setTimeout(() => processedMessages.delete(messageId), 5000);

        return {
            response: rule.response.replaceAll("\\n", "\n"),
            delay: (rule.ruleCooldown ?? 0) * 1000
        };
    }

    return null;
}

function checkRules(content: string, messageId: string): { response: string; delay: number; } | null {
    if (!content.length || processedMessages.has(messageId)) return null;
    if (Date.now() - lastResponseTime < settings.store.cooldown * 1000) return null;

    return (
        tryMatch(content, messageId, settings.store.stringRules ?? [], "string", matchStringRule) ??
        tryMatch(content, messageId, settings.store.regexRules ?? [], "regex", matchRegexRule)
    );
}

export default definePlugin({
    name: "AutoResponder",
    description: "Automatically responds to messages that match your triggers",
    tags: ["Fun", "Friends", "Chat"],
    authors: [Devs.RoScripter999],

    settings,

    stop() {
        processedMessages.clear();
        ruleLastResponseTimes.clear();
        lastResponseTime = 0;
    },

    flux: {
        MESSAGE_CREATE(event) {
            const { message } = event;
            const currentUser = UserStore.getCurrentUser();

            if (settings.store.ignoreSelf && message.author.id === currentUser?.id) return;
            if (settings.store.ignoreBots && message.author.bot) return;
            if (settings.store.ignoreServers && message.guild_id) return;

            const result = checkRules(message.content, message.id);
            if (result) {
                setTimeout(() => sendMessage(message.channel_id, { content: result.response }), result.delay);
            }
        }
    }
});
