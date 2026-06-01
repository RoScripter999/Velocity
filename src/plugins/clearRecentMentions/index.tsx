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

import type { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import { sleep } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Constants, FluxDispatcher, Icons, Menu, RestAPI } from "@webpack/common";

interface RecentMentionMessage {
    id?: string;
    channel_id?: string;
}

interface ClearResult {
    fetched: number;
    acked: number;
    dismissed: number;
    failed: number;
}

const logger = new Logger("ClearRecentMentions");

const MentionsActionCreators = findByPropsLazy("deleteRecentMention", "fetchRecentMentions") as {
    deleteRecentMention(messageId: string): void;
    clearMentions(): void;
};

function isWholeNumberInRange(value: unknown, min: number, max: number) {
    const n = Number(value);
    return Number.isInteger(n) && n >= min && n <= max;
}

const settings = definePluginSettings({
    fetchLimit: {
        type: OptionType.NUMBER,
        description: "How many recent mentions to fetch and clear per run. Discord's endpoint is paged, so run again if you have more.",
        default: 100,
        componentProps: { maxLength: 100 },
        isValid: value => isWholeNumberInRange(value, 1, 100) ? true : "Use a whole number from 1 to 100."
    },
    dismissDelayMs: {
        type: OptionType.NUMBER,
        description: "Delay between dismiss requests in milliseconds. Keep this non-zero to avoid bursty API behavior.",
        default: 250,
        isValid: value => isWholeNumberInRange(value, 0, 2000) ? true : "Use a whole number from 0 to 2000."
    },
    markRead: {
        type: OptionType.BOOLEAN,
        description: "Mark fetched mention channels as read before dismissing them.",
        default: true
    },
    includeRoleMentions: {
        type: OptionType.BOOLEAN,
        description: "Also fetch and clear role mentions.",
        default: true
    },
    includeEveryoneMentions: {
        type: OptionType.BOOLEAN,
        description: "Also fetch and clear @everyone/@here mentions.",
        default: true
    }
});

let isClearing = false;

async function fetchRecentMentions(): Promise<RecentMentionMessage[]> {
    const res = await RestAPI.get({
        url: Constants.Endpoints.MENTIONS,
        query: {
            limit: settings.store.fetchLimit,
            roles: settings.store.includeRoleMentions,
            everyone: settings.store.includeEveryoneMentions
        }
    });

    return res.body;
}

function ackMentions(mentions: RecentMentionMessage[]): number {
    const channels = mentions
        .filter((m): m is RecentMentionMessage & { id: string; channel_id: string; } => !!m.id && !!m.channel_id)
        .map(m => ({ channelId: m.channel_id, message: m, readStateType: 0 }));

    if (!channels.length) return 0;

    FluxDispatcher.dispatch({ type: "BULK_ACK", context: "APP", channels });
    return channels.length;
}

async function clearRecentMentions(): Promise<ClearResult> {
    isClearing = true;

    try {
        const mentions = await fetchRecentMentions();
        const result: ClearResult = {
            fetched: mentions.length,
            acked: settings.store.markRead ? ackMentions(mentions) : 0,
            dismissed: 0,
            failed: 0
        };

        for (const mention of mentions) {
            if (!mention.id) { result.failed++; continue; }

            try {
                MentionsActionCreators.deleteRecentMention(mention.id);
                result.dismissed++;
            } catch (error) {
                logger.error("Failed to dismiss mention", mention, error);
                result.failed++;
            }

            if (settings.store.dismissDelayMs > 0) await sleep(settings.store.dismissDelayMs);
        }

        return result;
    } finally {
        isClearing = false;
    }
}

const ClearMentionsMenuItem: NavContextMenuPatchCallback = children => {
    if (isClearing) return null;
    children.push(
        <Menu.MenuItem
            id="vc-clear-recent-mentions"
            label="Clear Recent Mentions"
            action={clearRecentMentions}
            icon={Icons.CopyIcon}
            leadingAccessory={{ type: "icon", icon: Icons.CopyIcon }}
        />
    );
};

export default definePlugin({
    name: "ClearRecentMentions",
    description: "Adds a Mentions filter menu action to mark recent mentions as read and dismiss them from the Inbox Mentions tab.",
    tags: ["Notifications", "Shortcuts", "Accessibility"],
    authors: [Devs.RoScripter999],
    settings,

    contextMenus: {
        "mentions-filter": { render: ClearMentionsMenuItem, required: true }
    }
});
