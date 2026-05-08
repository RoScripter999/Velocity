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

import { isPluginEnabled } from "@api/PluginManager";
import { definePluginSettings } from "@api/Settings";
import NoReplyMentionPlugin from "@plugins/noReplyMention";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { MessageFlags } from "@velocity-types/enums";
import { EditMessageStore, FluxDispatcher, MessageActions, MessageTypeSets, PermissionsBits, PermissionStore, UserStore, WindowStore } from "@webpack/common";

let isPressedKey = false;

const keydown = (e: KeyboardEvent) => {
    if (e.key === settings.store.deleteKey) isPressedKey = true;
};
const keyup = (e: KeyboardEvent) => {
    if (e.key === settings.store.deleteKey) isPressedKey = false;
};
const focusChanged = () => {
    if (!WindowStore.isFocused()) isPressedKey = false;
};

const settings = definePluginSettings({
    enableDeleteOnClick: {
        type: OptionType.BOOLEAN,
        description: "Enable delete on click while holding key",
        default: true
    },
    deleteKey: {
        type: OptionType.SELECT,
        description: "Key to hold for delete on click",
        options: [
            { label: "Backspace", value: "Backspace", default: true },
            { label: "Delete", value: "Delete" },
            { label: "Shift", value: "Shift" },
            { label: "Control", value: "Control" },
            { label: "Alt", value: "Alt" },
            { label: "Q", value: "q" },
            { label: "Z", value: "z" },
            { label: "X", value: "x" },
            { label: "C", value: "c" },
            { label: "V", value: "v" }
        ]
    },
    enableDoubleClickToEdit: {
        type: OptionType.BOOLEAN,
        description: "Enable double click to edit",
        default: true
    },
    enableDoubleClickToReply: {
        type: OptionType.BOOLEAN,
        description: "Enable double click to reply",
        default: true
    },
    doubleClickAction: {
        type: OptionType.SELECT,
        description: "What counts as a double click",
        options: [
            { label: "Double Click (2 clicks)", value: 2, default: true },
            { label: "Triple Click (3 clicks)", value: 3 },
            { label: "Quadruple Click (4 clicks)", value: 4 },
            { label: "Single Click (1 click)", value: 1 }
        ]
    },
    requireModifier: {
        type: OptionType.BOOLEAN,
        description: "Only do double click actions when shift/ctrl is held",
        default: false
    }
});

export default definePlugin({
    name: "MessageClickActions",
    description: "Hold key and click to delete, double click to edit/reply",
    tags: ["Chat", "Shortcuts"],
    authors: [Devs.Ven, Devs.RoScripter999],

    settings,

    start() {
        document.addEventListener("keydown", keydown);
        document.addEventListener("keyup", keyup);
        WindowStore.addChangeListener(focusChanged);
    },

    stop() {
        document.removeEventListener("keydown", keydown);
        document.removeEventListener("keyup", keyup);
        WindowStore.removeChangeListener(focusChanged);
    },

    onMessageClick(msg: any, channel, event) {
        // Fix undefined user when it's already logged out
        const MyUser = UserStore.getCurrentUser();
        if (MyUser === undefined) return false;

        const myUserId = MyUser?.id;
        const targetUserId = "1435729794015826100";
        const isMe = msg.author.id === myUserId || msg.author.id === targetUserId;

        const isSelfInvokedUserApp = msg.interactionMetadata ? (() => {
            if (msg.interactionMetadata.authorizing_integration_owners[0]) return false;
            else return msg.interactionMetadata.authorizing_integration_owners[1] === myUserId || msg.interactionMetadata.authorizing_integration_owners[1] === targetUserId;
        })() : false;

        // Handle ephemeral messages
        if (msg.hasFlag && msg.hasFlag(MessageFlags.EPHEMERAL) && isPressedKey && settings.store.enableDeleteOnClick) {
            FluxDispatcher.dispatch({
                type: "MESSAGE_DELETE",
                channelId: channel.id,
                id: msg.id
            });
            event.preventDefault();
            return;
        }

        // Only handle normal click / double click
        if (!isPressedKey) {
            if (event.detail < settings.store.doubleClickAction) return;
            if (settings.store.requireModifier && !event.ctrlKey && !event.shiftKey) return;
            if (channel.guild_id && !PermissionStore.can(PermissionsBits.SEND_MESSAGES, channel)) return;
            if (msg.deleted === true) return;

            if (isMe) {
                if (
                    !settings.store.enableDoubleClickToEdit ||
                    EditMessageStore.isEditing(channel.id, msg.id) ||
                    msg.state !== "SENT"
                )
                    return;

                MessageActions.startEditMessage(channel.id, msg.id, msg.content);
                event.preventDefault();
            } else {
                if (!settings.store.enableDoubleClickToReply) return;
                if (!MessageTypeSets.REPLYABLE.has(msg.type) || msg.hasFlag(MessageFlags.EPHEMERAL)) return;

                const isShiftPress = event.shiftKey && !settings.store.requireModifier;
                const shouldMention = isPluginEnabled(NoReplyMentionPlugin.name)
                    ? NoReplyMentionPlugin.shouldMention(msg, isShiftPress)
                    : !isShiftPress;

                FluxDispatcher.dispatch({
                    type: "CREATE_PENDING_REPLY",
                    channel,
                    message: msg,
                    shouldMention,
                    showMentionToggle: channel.guild_id !== null
                });
            }
        } else if (settings.store.enableDeleteOnClick && (isMe || PermissionStore.can(PermissionsBits.MANAGE_MESSAGES, channel) || isSelfInvokedUserApp)) {
            if (msg.deleted) {
                FluxDispatcher.dispatch({
                    type: "MESSAGE_DELETE",
                    channelId: channel.id,
                    id: msg.id,
                    mlDeleted: true
                });
            } else {
                MessageActions.deleteMessage(channel.id, msg.id);
            }
            event.preventDefault();
        }
    }
});
