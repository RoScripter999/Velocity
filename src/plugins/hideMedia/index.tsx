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

import "./styles.css";

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { get, set } from "@api/DataStore";
import { updateMessage } from "@api/MessageUpdater";
import { definePluginSettings } from "@api/Settings";
import { ImageInvisible, ImageVisible } from "@components/Icons";
import { Devs } from "@utils/constants";
import { classes } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import type { Channel, Message } from "@velocity-types";
import { ChannelStore, Menu, PopoverClasses } from "@webpack/common";

const KEY = "HideMedia_HiddenIds";

let hiddenMessages = new Set<string>();

const saveHiddenMessages = (ids: Set<string>) => set(KEY, ids);

const hasMedia = (msg: Message) => msg.attachments.length > 0 || msg.embeds.length > 0 || msg.stickerItems.length > 0;
const mediaIcon = (state: boolean) => state ? () => <ImageVisible colorClass={PopoverClasses.icon} /> : () => <ImageInvisible colorClass={PopoverClasses.icon} />;

const settings = definePluginSettings({
    contextMenu: {
        type: OptionType.BOOLEAN,
        description: "Show context menu option to hide/show media",
        default: true
    }
});

const messageContextMenuPatch: NavContextMenuPatchCallback = (
    children,
    { channel, message }: { channel: Channel; message: Message; }
) => {
    if (!settings.store.contextMenu) return;
    if (!hasMedia(message) && !message.messageSnapshots.some(s => hasMedia(s.message))) return;

    if (message.deleted) return;

    const isHidden = hiddenMessages.has(message.id);
    const menuGroup = findGroupChildrenByChildId(["delete", "report"], children);
    const index = menuGroup?.findIndex(i => i?.props?.id === "delete" || i?.props?.id === "report");
    if (!index || !menuGroup) return;

    menuGroup.splice(index - 1, 0, (
        <Menu.MenuItem
            id="toggle-hide-media"
            label={isHidden ? "Show Media" : "Hide Media"}
            color={isHidden ? undefined : "danger"}
            icon={mediaIcon(isHidden)}
            action={async () => {
                const ids = await getHiddenMessages();
                if (!ids.delete(message.id)) ids.add(message.id);
                await saveHiddenMessages(ids);
                updateMessage(channel.id, message.id);
            }}
        />

    ));
};

async function getHiddenMessages() {
    hiddenMessages = await get(KEY) ?? new Set();
    return hiddenMessages;
}

async function toggleHide(channelId: string, messageId: string) {
    const ids = await getHiddenMessages();
    if (!ids.delete(messageId))
        ids.add(messageId);

    await saveHiddenMessages(ids);
    updateMessage(channelId, messageId);
}

export default definePlugin({
    name: "HideMedia",
    description: "Hide attachments and embeds for individual messages via hover button",
    tags: ["Chat", "Appearance"],
    authors: [Devs.Ven, Devs.RoScripter999],
    dependencies: ["MessageUpdaterAPI"],
    searchTerms: ["HideImages", "HideAttachments"],
    settings,

    patches: [
        {
            find: "this.renderAttachments(",
            replacement: {
                match: /(?<=\i=)this\.render(?:Attachments|Embeds|StickersAccessories)\((\i)\)/g,
                replace: "$self.shouldHide($1?.id)?null:$&"
            }
        },
        {
            find: "hideTimestamp:!0,hideGuildTag:!1})",
            replacement: {
                match: /childrenAccessories:(\i)\.hideAccessories\?void 0:\(0,(\i)\.(\i)\)\((\i),(\i),(\i)\)/,
                replace: 'childrenAccessories:$1.hideAccessories?void 0:$self.shouldHide($4?.message?.id)?(0,r.jsx)("span",{className:"vc-hideAttachments",children:"Media Hidden"}):(0,$2.$3)($4,$5,$6)'
            }
        }
    ],

    contextMenus: {
        "message": messageContextMenuPatch
    },

    messagePopoverButton: {
        icon: ImageInvisible,
        render(msg) {
            if (!hasMedia(msg) && !msg.messageSnapshots.some(s => hasMedia(s.message))) return null;

            const isHidden = hiddenMessages.has(msg.id);

            return {
                label: isHidden ? "Show Media" : "Hide Media",
                icon: mediaIcon(isHidden),
                message: msg,
                channel: ChannelStore.getChannel(msg.channel_id),
                onClick: () => toggleHide(msg.channel_id, msg.id)
            };
        }
    },

    renderMessageAccessory({ message }) {
        if (!this.shouldHide(message.id)) return null;

        return (
            <span className={classes("vc-hideAttachments-accessory", !message.content && "vc-hideAttachments-no-content")}>
                Media Hidden
            </span>
        );
    },

    async start() {
        await getHiddenMessages();
    },

    stop() {
        hiddenMessages.clear();
    },

    shouldHide(messageId: string) {
        return hiddenMessages?.has(messageId);
    }
});


