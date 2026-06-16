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
import { Card } from "@components/Card";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import pinDms from "@plugins/pinDms";
import { isPinned } from "@plugins/pinDms/data";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { FluxDispatcher, Forms, Icons, Menu, TagGroup, TextInput, Toasts, Tooltip, UserStore, useState } from "@webpack/common";
import type { KeyboardEvent } from "react";

type Rule = Record<"word", string>;

const cl = classNameFactory("vc-hide-messages-");

interface RulesProps {
    rulesArray: Rule[];
}

interface PrivateChannelsListInstance {
    forceUpdate(callback?: () => void): void;
}

const hiddenDmIds = new Set<string>();
let privateChannelsListInstance: PrivateChannelsListInstance | null = null;
let showHiddenDms = false;

const makeEmptyRule: () => Rule = () => ({ word: "" });

const settings = definePluginSettings({
    wordRules: {
        type: OptionType.COMPONENT,
        component: () => {
            const { wordRules } = settings.use(["wordRules"]);
            return <RulesSettings rulesArray={wordRules} />;
        },
        default: [makeEmptyRule()]
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

function RulesSettings({ rulesArray }: RulesProps) {
    const [inputValue, setInputValue] = useState("");
    const hasWords = rulesArray.some(r => r.word);

    const handleTag = (action: "add" | "remove", value?: string | Set<string>) => {
        if (action === "add") {
            if (!inputValue.trim()) return;
            const exists = rulesArray.some(r => r.word.toLowerCase() === inputValue.toLowerCase());
            if (!exists) {
                rulesArray.push({ word: inputValue });
                setInputValue("");
            }
        } else if (action === "remove" && value instanceof Set) {
            value.forEach(key => {
                const index = rulesArray.findIndex(r => r.word === key);
                if (index !== -1) rulesArray.splice(index, 1);
            });
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleTag("add");
        }
    };

    return (
        <>
            <Flex flexDirection="row">
                <TextInput
                    placeholder="Add word or phrase..."
                    value={inputValue}
                    maxLength={50}
                    helperText="Press Enter to add this word"
                    showCharacterCount={true}
                    onChange={setInputValue}
                    onKeyDown={handleKeyDown}
                />
            </Flex>

            {hasWords && (
                <Forms.FormSection tag="h4" title="Words to Remove">
                    <Card className={cl("card")}>
                        <div className={cl("tags-container")}>
                            <TagGroup
                                label="Word Filters"
                                layout="inline"
                                items={rulesArray.filter(r => r.word).map(r => ({ id: r.word, label: r.word }))}
                                onRemove={keys => handleTag("remove", keys)}
                            />
                        </div>
                    </Card>
                </Forms.FormSection>
            )}
        </>
    );
}

const toggleWord = (word: string) => {
    const rules = settings.store.wordRules;
    const index = rules.findIndex(r => r.word.toLowerCase() === word.toLowerCase());

    if (index !== -1) {
        rules.splice(index, 1);
        Toasts.show({ message: `Removed "${word}" from message filter`, id: Toasts.genId(), type: Toasts.Type.SUCCESS });
    } else {
        rules.push({ word });
        Toasts.show({ message: `Added "${word}" to message filter`, id: Toasts.genId(), type: Toasts.Type.SUCCESS });
    }
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
                const exists = settings.store.wordRules.some(r => r.word.toLowerCase() === selection.toLowerCase());
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

    const wordsToRemove = wordRules.filter(r => r.word);
    if (wordsToRemove.length === 0) return false;

    const messageContent = message.content;
    if (!messageContent || typeof messageContent !== "string") return false;

    if (removeMode === "entire") {
        return wordsToRemove.some(rule => messageContent.toUpperCase().includes(rule.word.toUpperCase()));
    } else {
        let filteredContent = messageContent;
        wordsToRemove.forEach(rule => {
            const word = rule.word.toUpperCase();
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
    if (isPluginEnabled(pinDms.name) && isPinned(channel.id)) return;

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
                    match: /LOAD_MESSAGES_SUCCESS:function\((\w+)\)\{let\{[\s\S]*?messages:(\w+),[\s\S]*?avoidInitialScroll:(\w+)\}=\1/,
                    replace: "$&;$2=$2.filter(m=>!$self.filterMessage(m))"
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
        icon: () => <Icons.EyeIcon color="currentColor" size="refresh_sm" />,
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
