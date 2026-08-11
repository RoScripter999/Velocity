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

import { ApplicationCommandOptionType } from "@api/Commands";
import { InlineCode } from "@components/CodeBlock";
import { ExpandableCard } from "@components/ExpandableCard";
import { Flex } from "@components/Flex";
import { Paragraph } from "@components/Paragraph";
import type { ModalPropsRender } from "@velocity-types";
import { Field, Icons, Modal, openModal, TextArea, TextInput, useState } from "@webpack/common";

import { parseTagArguments, validateTagArguments } from ".";
import { cl, ManageTagsList } from "./ManageTagsList";
import { addTag, removeTag, type Tag } from "./settings";

function getTypeString(type: ApplicationCommandOptionType | "unknown"): string {
    const typeMap: Record<string, string> = {
        [ApplicationCommandOptionType.STRING]: "string",
        [ApplicationCommandOptionType.INTEGER]: "integer",
        [ApplicationCommandOptionType.BOOLEAN]: "boolean",
        [ApplicationCommandOptionType.USER]: "user",
        [ApplicationCommandOptionType.ROLE]: "role",
        [ApplicationCommandOptionType.NUMBER]: "number"
    };
    return typeMap[type] ?? "unknown";
}

export function openCreateTagModal(initialValue?: Tag) {
    openModal(modalProps => (
        <CreateTagDialog initialValue={initialValue ?? { name: "", message: "" }} modalProps={modalProps} />
    ));
}

export function openManageTagModal() {
    openModal(modalProps => (
        <Modal
            {...modalProps}
            title="Manage Custom Commands"
            subtitle="Create custom commands. Write / then your tag name (e.g: /hello) in the chat input and execute the command to send!"
            actions={[
                { text: "Close", variant: "secondary", onClick: modalProps.onClose },
                { text: "Create", onClick: () => openCreateTagModal() }
            ]}
        >
            <ManageTagsList isModal />
        </Modal >
    ));
}

const EXAMPLE_RESPONSE = "Hello {{user, type = user}}! I am feeling {{mood = great}}.";

function CreateTagDialog({ initialValue, modalProps }: { initialValue: Tag; modalProps: ModalPropsRender; }) {
    const [name, setName] = useState(initialValue.name);
    const [message, setMessage] = useState(initialValue.message.replaceAll("\\n", "\n"));

    const isEdit = Boolean(initialValue.name);

    const detectedArguments = parseTagArguments(message);
    const hasReservedEphemeral = detectedArguments.some(arg => arg.name === "ephemeral");
    const argumentErrors = validateTagArguments(message);

    return (
        <Modal
            {...modalProps}
            title={isEdit ? "Edit Tag" : "Create New Tag"}
            subtitle={isEdit ? "Edit your custom command." : "Create a new tag which will be registered as a slash command."}
            actions={[
                {
                    text: "Cancel",
                    variant: "secondary",
                    onClick: modalProps.onClose
                },
                {
                    text: isEdit ? "Save" : "Create",
                    variant: "primary",
                    onClick: () => {
                        if (isEdit && initialValue.name !== name) {
                            removeTag(initialValue.name);
                        }

                        const tag = { name, message };
                        addTag(tag);
                        modalProps.onClose();
                    },
                    disabled: !name || !message || hasReservedEphemeral || argumentErrors.length > 0
                }
            ]}
            notice={argumentErrors.length > 0 ? { message: argumentErrors[0], type: "critical" } : undefined}
        >
            <Flex flexDirection="column" gap={12}>
                <TextInput label="Name" value={name} onChange={setName} placeholder="greet" />

                <TextArea label="Response" value={message} onChange={setMessage} placeholder={EXAMPLE_RESPONSE} />

                {detectedArguments.length > 0 && (
                    <Field label="Detected Arguments">
                        {detectedArguments.map(arg => (
                            <li className={cl("argument")} key={arg.name}>
                                <b>{arg.name}</b> (type: {getTypeString(arg.type)}){arg.defaultValue ? ` (default: ${arg.defaultValue})` : ""}
                            </li>
                        ))}
                    </Field>
                )}

                <ExpandableCard
                    render={() => (
                        <Flex flexDirection="column" gap={12}>
                            <Paragraph>
                                Your response can include variables wrapped in double curly braces which will become command arguments, for example <InlineCode>{"Hello {{user}}"}</InlineCode>.
                            </Paragraph>
                            <Paragraph>
                                You can specify arguments with default values by using an equals sign, for example <InlineCode>{"Hello {{user = pal}}"}</InlineCode>.
                            </Paragraph>
                            <Paragraph>
                                You can also specify the argument type using a comma, for example <InlineCode>{"{{user, type = user}}"}</InlineCode>. Available types: string, integer, number, boolean, user, role.
                            </Paragraph>

                            <section>
                                <Paragraph><b>Example Command response:</b> <InlineCode>{EXAMPLE_RESPONSE}</InlineCode></Paragraph>
                                <Paragraph><b>Example usage:</b> <InlineCode>{"/greet user:@Clyde"}</InlineCode></Paragraph>
                                <Paragraph><b>Example output:</b> <InlineCode>{"Hello @Clyde! I am feeling great."}</InlineCode></Paragraph>
                            </section>
                        </Flex>
                    )}
                >
                    <Flex alignItems="center" gap={8}>
                        <Icons.CircleInformationIcon color="var(--text-muted)" size="sm" />
                        View Arguments guide
                    </Flex>
                </ExpandableCard>
            </Flex>
        </Modal>
    );
}
