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
import { definePluginSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { Forms, Menu, TagGroup, TextInput, Toasts, UserStore, useState } from "@webpack/common";
import type { KeyboardEvent } from "react";

type Rule = Record<"word", string>;

const cl = classNameFactory("vc-rm-");

interface RulesProps {
    rulesArray: Rule[];
}

const makeEmptyRule: () => Rule = () => ({
    word: ""
});

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
                if (index !== -1) {
                    rulesArray.splice(index, 1);
                }
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
                <>
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
                </>
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

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, _props) => {
    const selection = document.getSelection()?.toString();
    if (!selection) return;

    const group = findGroupChildrenByChildId("search-google", children);
    if (!group) return;

    const idx = group.findIndex(c => c?.props?.id === "search-google");
    if (idx === -1) return;

    const exists = settings.store.wordRules.some(r => r.word.toLowerCase() === selection.toLowerCase());
    const displayText = selection.length > 15 ? selection.slice(0, 15) + "..." : selection;

    group.splice(idx + 1, 0,
        <Menu.MenuItem
            key="vc-remove-messages"
            id="add-message-filter"
            label={exists ? "Remove MessageFilter" : "Add MessageFilter"}
            shortcut={displayText}
            action={() => toggleWord(selection)}
        />
    );
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
        const shouldRemove = wordsToRemove.some(rule => {
            const match = messageContent.toUpperCase().includes(rule.word.toUpperCase());
            return match;
        });
        return shouldRemove;
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

export default definePlugin({
    name: "HideMessages",
    description: "Removes messages containing specified words",
    searchTerms: ["FilterMessages", "RemoveMessages"],
    tags: ["Chat", "Utility", "Privacy"],
    authors: [Devs.RoScripter999],

    settings,

    contextMenus: {
        "message": messageContextMenuPatch
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
        }
    ],

    filterMessage
});
