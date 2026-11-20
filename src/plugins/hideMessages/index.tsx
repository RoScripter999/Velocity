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

import "./styles.css";

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { isPluginEnabled } from "@api/PluginManager";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import pinDmsPlugin from "@plugins/pinDms";
import { isPinned } from "@plugins/pinDms/data";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { FluxDispatcher, Icons, Menu, showToast, Tooltip, UserStore } from "@webpack/common";

const cl = classNameFactory("vc-hide-messages-");

interface PrivateChannelsListInstance {
    forceUpdate(callback?: () => void): void;
}

const hiddenDmIds = new Set<string>();
let privateChannelsListInstance: PrivateChannelsListInstance | null = null;
let showHiddenDms = false;

const settings = definePluginSettings({
    wordRules: {
        type: OptionType.STRING,
        description: "Words or phrases to remove, separated by commas",
        default: "",
        multiline: true
    },
    ignoreBots: {
        type: OptionType.BOOLEAN,
        description: "Ignore messages from bots",
        default: true
    },
    ignoreSelf: {
        type: OptionType.BOOLEAN,
        description: "Ignore your own messages",
        default: true
    },
    removeMode: {
        type: OptionType.SELECT,
        description: "How to remove filtered words",
        default: "entire",
        options: [
            { label: "Remove entire message", value: "entire" },
            { label: "Remove only the phrase", value: "phrase" }
        ]
    }
});

const toggleWord = (word: string) => {
    const words = settings.store.wordRules.split(",").map(w => w.trim()).filter(Boolean);
    const index = words.findIndex(w => w.toLowerCase() === word.toLowerCase());

    if (index !== -1) {
        words.splice(index, 1);
        showToast({ text: `Removed "${word}" from message filter`, variant: "success" });
    } else {
        words.push(word);
        showToast({ text: `Added "${word}" to message filter`, variant: "success" });
    }

    settings.store.wordRules = words.join(", ");
};

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message; }) => {
    const pinGroup = findGroupChildrenByChildId("pin", children);
    if (pinGroup) {
        pinGroup.splice(pinGroup.findIndex(c => c?.props?.id === "pin") + 1, 0, (
            <Menu.MenuItem
                id="vc-hidemessages"
                label="Hide Message"
                icon={hideIcon(true)}
                leadingAccessory={{ type: "icon", icon: hideIcon(true) }}
                action={() => hideMessage(message.id, message.channel_id)}
            />
        ));
    }

    const selection = document.getSelection()?.toString();
    if (selection) {
        const searchGroup = findGroupChildrenByChildId("search-google", children);
        if (searchGroup) {
            const idx = searchGroup.findIndex(c => c?.props?.id === "search-google");
            if (idx !== -1) {
                const exists = settings.store.wordRules.split(",").map(w => w.trim().toLowerCase()).includes(selection.toLowerCase());
                const displayText = selection.length > 15 ? selection.slice(0, 15) + "..." : selection;
                searchGroup.splice(idx + 1, 0,
                    <Menu.MenuItem
                        key="vc-remove-messages"
                        id="add-message-filter"
                        label={exists ? "Remove MessageFilter" : "Add MessageFilter"}
                        shortcut={displayText}
                        action={() => toggleWord(selection)}
                    />
                );
            }
        }
    }
};

const filterMessage = (message: Message) => {
    const { ignoreBots, ignoreSelf, wordRules, removeMode } = settings.store;

    if (!message?.author?.id) return false;
    if (ignoreSelf && message.author.id === UserStore.getCurrentUser()?.id) return false;
    if (ignoreBots && message.author.bot) return false;

    const wordsToRemove = wordRules.split(",").map(w => w.trim()).filter(Boolean);
    if (wordsToRemove.length === 0) return false;

    const messageContent = message.content;
    if (!messageContent || typeof messageContent !== "string") return false;

    if (removeMode === "entire") {
        return wordsToRemove.some(word => messageContent.toUpperCase().includes(word.toUpperCase()));
    } else {
        let filteredContent = messageContent;
        wordsToRemove.forEach(word => {
            word = word.toUpperCase();
            let temp = "";
            let i = 0;
            while (i < filteredContent.length) {
                if (filteredContent.substring(i, i + word.length).toUpperCase() === word) {
                    i += word.length;
                } else {
                    temp += filteredContent[i];
                    i++;
                }
            }
            filteredContent = temp.trim();
        });
        if (filteredContent !== messageContent) {
            message.content = filteredContent;
        }
    }

    return false;
};

const hideIcon = (hidden: boolean) => hidden ? Icons.EyeSlashIcon : Icons.EyeIcon;

const hideMessage = (messageId: string, channelId: string) => {
    FluxDispatcher.dispatch({
        type: "MESSAGE_DELETE",
        id: messageId,
        channelId,
        mlDeleted: true
    });
};

function toggleDm(channelId: string) {
    if (hiddenDmIds.has(channelId)) {
        hiddenDmIds.delete(channelId);
        if (!hiddenDmIds.size) showHiddenDms = false;
    } else {
        hiddenDmIds.add(channelId);
    }
    privateChannelsListInstance?.forceUpdate();
}

const userMenuPatch: NavContextMenuPatchCallback = (children, { channel }) => {
    if (!channel?.isDM()) return;
    if (isPluginEnabled(pinDmsPlugin.name) && isPinned(channel.id)) return;

    const group = findGroupChildrenByChildId("pin-dm", children);
    if (!group) return;

    const hidden = hiddenDmIds.has(channel.id);
    group.splice(group.findIndex(c => c?.props?.id === "pin-dm") + 1, 0, (
        <Menu.MenuItem
            id="vc-hidemessages-dm"
            label={hidden ? "Unhide DM" : "Hide DM"}
            icon={hideIcon(hidden)}
            leadingAccessory={{ type: "icon", icon: hideIcon(hidden) }}
            action={() => toggleDm(channel.id)}
        />
    ));
};

export default definePlugin({
    name: "HideMessages",
    description: "Filter messages by word/phrase and temporarily hide individual messages or DMs.",
    searchTerms: ["FilterMessages", "RemoveMessages"],
    tags: ["Chat", "Utility", "Privacy"],
    authors: [Devs.RoScripter999],

    settings,

    contextMenus: {
        "message": { render: messageContextMenuPatch, required: true },
        "user-context": { render: userMenuPatch, required: true }
    },

    patches: [
        {
            find: ".__invalid_blocked,",
            replacement: [
                {
                    match: /let{expanded:\i,[^}]*?collapsedReason[^}]*}/,
                    replace: "if($self.filterMessage(arguments[0]))return null;$&"
                }
            ]
        },
        {
            find: '"MessageStore"',
            replacement: [
                {
                    match: /MESSAGE_CREATE:function\((\w+)\)\{/,
                    replace: "MESSAGE_CREATE:function($1){if($self.filterMessage($1.message))return;"
                },
                {
                    match: /(LOAD_MESSAGES_SUCCESS:function\(\i\)\{(?:(?!newMessages:)[\s\S]){0,250}newMessages:)(\i)/,
                    replace: "$1$2.filter(m=>!$self.filterMessage(m))"
                }
            ]
        },
        {
            find: '"dm-quick-launcher"===',
            replacement: [
                {
                    match: /render\(\)\{/,
                    replace: "$&this.props.privateChannelIds=$self.filterPrivateChannelIds(this.props.privateChannelIds,this);"
                },
                {
                    match: /renderRow=\i=>\{/,
                    replace: "$&this.props.privateChannelIds=$self.filterPrivateChannelIds(this.props.privateChannelIds,this);"
                },
                {
                    match: /renderDM=\(\i,\i\)=>\{/,
                    replace: "$&this.props.privateChannelIds=$self.filterPrivateChannelIds(this.props.privateChannelIds,this);"
                },
                {
                    match: /#{intl::DIRECT_MESSAGES}\)\}\),/,
                    replace: "$&$self.renderHiddenMessagesToggle(),"
                }
            ]
        }
    ],

    messagePopoverButton: {
        icon: () => Icons.EyeIcon,
        render(msg) {
            return {
                label: "Hide",
                icon: Icons.EyeIcon,
                onClick: () => hideMessage(msg.id, msg.channel_id)
            };
        }
    },

    stop() {
        hiddenDmIds.clear();
        showHiddenDms = false;
        privateChannelsListInstance?.forceUpdate();
        privateChannelsListInstance = null;
    },

    filterPrivateChannelIds(privateChannelIds: string[], instance?: PrivateChannelsListInstance) {
        privateChannelsListInstance = instance ?? privateChannelsListInstance;
        return showHiddenDms ? privateChannelIds : privateChannelIds.filter(id => !hiddenDmIds.has(id));
    },

    renderHiddenMessagesToggle: ErrorBoundary.wrap(() => {
        const hasHiddenDms = hiddenDmIds.size > 0;
        const label = !hasHiddenDms ? "No Hidden DMs" : showHiddenDms ? "Hide Hidden DMs" : "Show Hidden DMs";

        return (
            <Tooltip text={label}>
                {tooltipProps => (
                    <div
                        {...tooltipProps}
                        className={cl("button")}
                        role="button"
                        tabIndex={0}
                        aria-label={label}
                        aria-disabled={!hasHiddenDms}
                        onClick={event => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!hasHiddenDms) return;
                            showHiddenDms = !showHiddenDms;
                            privateChannelsListInstance?.forceUpdate();
                        }}
                    >
                        <Icons.EyeIcon className={cl("icon")} color="currentColor" />
                    </div>
                )}
            </Tooltip>
        );
    }, { noop: true }),

    filterMessage
});
