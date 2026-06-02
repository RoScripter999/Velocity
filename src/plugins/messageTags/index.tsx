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

import { ChatBarButton, type ChatBarButtonFactory } from "@api/ChatButtons";
import { ApplicationCommandInputType, ApplicationCommandOptionType, registerCommand, unregisterCommand } from "@api/Commands";
import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { get, set } from "@api/DataStore";
import { Flex } from "@components/Flex";
import { Icon } from "@components/Icons";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import definePlugin, { type IconComponent } from "@utils/types";
import type { Message, ModalPropsRender } from "@velocity-types";
import { Buttons, Forms, Icons, Menu, Modal, openModal, showToast, Text, TextArea, TextInput, Toasts, useEffect, useState } from "@webpack/common";

interface Tag {
    id: string;
    command: string;
    content: string;
}

const cl = classNameFactory("vc-cm-");
const MessageTagsMarker = Symbol("MessageTags");
const TAGS_KEY = "MESSAGE_TAGS";

const getTags = async (): Promise<Tag[]> => {
    const tags = await get(TAGS_KEY);
    return tags || [];
};

const getTag = async (name: string) => {
    const tags = await getTags();
    return tags.find(m => m.command === name) ?? null;
};

const deleteTag = async (id: string) => {
    const tags = await getTags();
    const tag = tags.find(m => m.id === id);
    if (tag) {
        unregisterCommand(tag.command);
        await set(TAGS_KEY, tags.filter(m => m.id !== id));
    }
};

const createTagCommand = (msg: Tag) => {
    unregisterCommand(msg.command);
    registerCommand({
        name: msg.command,
        description: `Send tag: ${msg.command}`,
        inputType: ApplicationCommandInputType.BUILT_IN_TEXT,
        execute: async interaction => {
            const message = await getTag(msg.command);

            if (!message) {
                interaction.reply({
                    content: `Tag **${msg.command}** doesn't exist`
                });
                return { content: `/${msg.command}` };
            }

            return { content: message.content };
        },
        [MessageTagsMarker]: true
    }, "MessageTags");
};

function Tag({
    title,
    children,
    defaultExpanded = false,
    onDelete
}: {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    onDelete?: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={cl("tag")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Flex justifyContent="space-between" alignItems="center" className={cl("tag-header")} onClick={() => setIsExpanded(!isExpanded)}>
                <Flex alignItems="center" gap="8px" style={{ flex: 1 }}>
                    <Icon
                        className={cl("tag-chevron", isExpanded && "tag-chevron-expanded")}
                        width="16"
                        height="16"
                    >
                        <path fill="currentColor" d="M9.29 15.88L13.17 12 9.29 8.12a.996.996 0 1 1 1.41-1.41l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3a.996.996 0 0 1-1.41 0c-.38-.39-.39-1.03 0-1.42z" />
                    </Icon>
                    <Text>{title}</Text>
                </Flex>
                {onDelete && isHovered && (
                    <Buttons.IconButton
                        icon={() => <Icons.TrashIcon size="sm" />}
                        variant="icon-only"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    />
                )}
            </Flex>
            {isExpanded && (
                <div className={cl("tag-content")}>
                    {children}
                </div>
            )}
        </div>
    );
}

function PickerModal({ modalProps, prefilledContent }: { modalProps: ModalPropsRender; prefilledContent?: string; }) {
    const [messages, setMessages] = useState<Tag[]>(() => {
        const existingMessages = typeof prefilledContent === "string"
            ? [
                {
                    id: Date.now().toString(),
                    command: "",
                    content: prefilledContent
                }
            ]
            : [];
        return existingMessages;
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getTags().then(tags => {
            setMessages(prev => [...tags, ...prev]);
            setIsLoading(false);
        });
    }, []);

    const addMessage = () => {
        setMessages([
            ...messages,
            {
                id: Date.now().toString(),
                command: "",
                content: ""
            }
        ]);
    };

    const updateMessage = (id: string, field: "command" | "content", value: string) => {
        if (field === "command") {
            value = value.replace(/\s+/g, "").toLowerCase();
        }

        setMessages(messages.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const deleteMessage = (id: string) => {
        setMessages(messages.filter(m => m.id !== id));
    };

    const isCommandValid = (command: string, currentId: string) => {
        if (!command || !/^[a-z0-9]+$/.test(command)) return false;
        return !messages.some(m => m.id !== currentId && m.command === command);
    };

    const canSave = () => {
        const validTags = messages.filter(m => m.command && m.content);
        return validTags.every(m => isCommandValid(m.command, m.id));
    };

    const saveMessages = async () => {
        if (!canSave()) return;

        const filtered = messages.filter(m => m.command && m.content);
        await set(TAGS_KEY, filtered);

        const tags = await getTags();
        tags.forEach(m => unregisterCommand(m.command));
        filtered.forEach(createTagCommand);

        modalProps.onClose();
    };

    const exportMessages = () => {
        try {
            const blob = new Blob(
                [JSON.stringify(messages.filter(m => m.command && m.content), null, 2)],
                { type: "application/json" }
            );

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tags-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            showToast("Export failed", Toasts.Type.FAILURE);
        }
    };

    const importMessages = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";

        input.onchange = async e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const imported: any[] = JSON.parse(await file.text());
                if (!Array.isArray(imported)) throw new Error("Expected array");

                const valid = imported.filter(m =>
                    typeof m.command === "string" &&
                    typeof m.content === "string" &&
                    m.command.length > 0
                );

                if (!valid.length) throw new Error("No valid tags");

                const withIds = valid.map(m => ({
                    ...m,
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`
                }));

                setMessages(withIds);
                showToast(`Imported ${valid.length} tag${valid.length !== 1 ? "s" : ""}`, Toasts.Type.SUCCESS);
            } catch (err) {
                showToast(`Import failed: ${err instanceof Error ? err.message : "Unknown"}`, Toasts.Type.FAILURE);
            }
        };

        input.click();
    };

    if (isLoading) {
        return (
            <Modal title="Loading..." {...modalProps} />
        );
    }

    return (
        <Modal
            title="Message Tags"
            subtitle={`${messages.filter(m => m.command && m.content).length} Message${messages.filter(m => m.command && m.content).length !== 1 ? "s" : ""}`}
            actions={[
                { size: "sm", text: "Save & Close", onClick: saveMessages, fullWidth: true, disabled: !canSave() },
                { size: "sm", text: "Import", onClick: importMessages, variant: "secondary" },
                {
                    size: "sm",
                    text: "Export",
                    onClick: exportMessages,
                    variant: "secondary",
                    disabled: !messages.filter(m => m.command && m.content).length
                }
            ]}
            {...modalProps}
        >
            <div>
                {messages.length === 0 ? (
                    <Paragraph className={Margins.bottom16}>No tags yet. Click the button below to create one.</Paragraph>
                ) : (
                    messages.map(msg => {
                        const isNew = !msg.command || !msg.content;
                        const valid = isCommandValid(msg.command, msg.id);
                        const error = !msg.command ? "Name required" : !valid ? "Invalid/duplicate" : undefined;

                        return (
                            <Tag
                                key={msg.id}
                                title={msg.command || "New Tag"}
                                defaultExpanded={isNew}
                                onDelete={() => deleteMessage(msg.id)}
                            >
                                <Forms.FormSection tag="h3" title="Tag Name">
                                    <TextInput
                                        value={msg.command}
                                        onChange={v => updateMessage(msg.id, "command", v)}
                                        placeholder="e.g. greet"
                                        error={error}
                                    />
                                </Forms.FormSection>

                                <Forms.FormSection tag="h3" title="Content" className={Margins.top16}>
                                    <TextArea
                                        value={msg.content}
                                        onChange={v => updateMessage(msg.id, "content", v)}
                                        placeholder="Message..."
                                        rows={3}
                                    />
                                </Forms.FormSection>
                            </Tag>
                        );
                    })
                )}

                <div className={cl("add-button")}>
                    <Buttons.Button size="sm" onClick={addMessage} text="Add Tag" fullWidth icon={Icons.PlusMediumIcon} />
                </div>
            </div>
        </Modal>
    );
}

const MessageTagsIcon: IconComponent = ({ width = 20, height = 20 }) => (
    <Icon
        width={width}
        height={height}
        viewBox="0 0 20 20"
    >
        <path
            d="M5.02 6.227a1.038 1.038 0 0 1-1.043-1.032c0-.569.467-1.03 1.043-1.03.576 0 1.043.461 1.043 1.03 0 .57-.467 1.032-1.043 1.032m14.369 4.42-3.455-3.414C10.06 1.429 11.435 2.819 9.158.419 8.962.225 8.697 0 8.42 0H2.085C.934 0 0 1.157 0 2.295v6.26c0 .274.11.536.305.73 4.091 4.042 1.145 1.13 10.232 10.111a2.104 2.104 0 0 0 2.95 0l5.902-5.833a2.045 2.045 0 0 0 0-2.915"
            fill="currentColor"
            fillRule="evenodd"
        />
    </Icon>
);

const MessageTagsButton: ChatBarButtonFactory = ({ isAnyChat }) => {
    if (!isAnyChat) return null;

    return (
        <ChatBarButton
            tooltip="Message Tags"
            onClick={() => {
                const key = openModal(props => (
                    <PickerModal modalProps={props} />
                ));
            }}
            buttonProps={{ "aria-haspopup": "dialog" }}
        >
            <MessageTagsIcon />
        </ChatBarButton>
    );
};

function getMessageContent(message: Message) {
    return message.content
        || message.messageSnapshots?.[0]?.message.content
        || message.embeds?.find(embed => embed.type === "auto_moderation_message")?.rawDescription
        || "";
}

const messageCtxPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message; }) => {
    const content = getMessageContent(message);
    if (!content) return;

    const group = findGroupChildrenByChildId("copy-text", children);
    if (!group) return;

    const idx = group.findIndex(c => c?.props?.id === "copy-text");
    if (idx === -1) return;

    group.splice(idx + 1, 0, (
        <Menu.MenuItem
            id="vc-save-tag"
            label="Save as Tag"
            icon={MessageTagsIcon}
            action={() => {
                const key = openModal(props => (
                    <PickerModal
                        modalProps={props}
                        prefilledContent={content}
                    />
                ));
            }}
        />
    ));
};

export default definePlugin({
    name: "MessageTags",
    description: "Save and reuse messages as tags",
    tags: ["Commands", "Customisation", "Utility"],
    authors: [Devs.Luna],

    async start() {
        const tags = await getTags();
        tags.forEach(createTagCommand);
    },

    async stop() {
        const tags = await getTags();
        tags.forEach(m => unregisterCommand(m.command));
    },

    contextMenus: {
        "message": messageCtxPatch
    },

    chatBarButton: {
        icon: MessageTagsIcon,
        render: MessageTagsButton
    },

    commands: [
        {
            name: "tags",
            description: "Manage tags",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    name: "list",
                    description: "List all tags",
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: []
                },
                {
                    name: "delete",
                    description: "Remove a tag",
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: "tag-name",
                            description: "Tag to delete",
                            type: ApplicationCommandOptionType.STRING,
                            required: true
                        }
                    ]
                },
                {
                    name: "preview",
                    description: "Preview a tag",
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: "tag-name",
                            description: "Tag to preview",
                            type: ApplicationCommandOptionType.STRING,
                            required: true
                        }
                    ]
                }
            ],

            async execute(interaction) {
                const subcommand = interaction.getSubcommand();
                const name = interaction.options.getString("tag-name", true);
                const tags = await getTags();

                if (subcommand === "list") {
                    if (!tags.length) {
                        return void interaction.reply({ content: "No tags" });
                    }

                    interaction.reply({
                        embeds: [{
                            title: `Tags (${tags.length})`,
                            description: tags.map(t => `\`${t.command}\`: ${t.content.slice(0, 60)}${t.content.length > 60 ? "..." : ""}`).join("\n"),
                            color: 0xd77f7f,
                            type: "rich"
                        }]
                    });
                } else if (subcommand === "delete") {
                    const tag = await getTag(name);
                    if (!tag) {
                        return void interaction.reply({ content: `Tag **${name}** not found` });
                    }

                    await deleteTag(tag.id);
                    interaction.reply({ content: `Deleted **${name}**` });
                } else if (subcommand === "preview") {
                    const tag = await getTag(name);
                    if (!tag) {
                        return void interaction.reply({ content: `Tag **${name}** not found` });
                    }

                    interaction.reply({ content: tag.content });
                }
            }
        }
    ]
});
