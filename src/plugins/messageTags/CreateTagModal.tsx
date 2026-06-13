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

import { ExpandableCard } from "@components/ExpandableCard";
import { InlineCode } from "@components/CodeBlock";
import { Flex } from "@components/Flex";
import { HeadingSecondary } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";
import type { ModalPropsRender } from "@velocity-types";
import { Icons, Modal, openModal, TextArea, TextInput, useState } from "@webpack/common";

import { parseTagArguments } from ".";
import { addTag, getTag, removeTag, Tag } from "./settings";

export function openCreateTagModal(initialValue: Tag = { name: "", message: "" }) {
    openModal(modalProps => (
        <CreateTagDialog initialValue={initialValue} modalProps={modalProps} />
    ));
}

const EXAMPLE_RESPONSE = "Hello {{user}}! I am feeling {{mood = great}}.";

function CreateTagDialog({ initialValue, modalProps }: { initialValue: Tag; modalProps: ModalPropsRender; }) {
    const [name, setName] = useState(initialValue.name);
    const [message, setMessage] = useState(initialValue.message.replaceAll("\\n", "\n"));

    const isEdit = Boolean(initialValue.name);

    const detectedArguments = parseTagArguments(message);
    const hasReservedEphemeral = detectedArguments.some(arg => arg.name === "ephemeral");
    const nameAlreadyExists = name !== initialValue.name && getTag(name);

    const notice = hasReservedEphemeral
        ? 'The argument name "ephemeral" is reserved and cannot be used.'
        : nameAlreadyExists
            ? `A tag with the name "${name}" already exists and will be overwritten.`
            : undefined;

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
                    disabled: !name || !message || hasReservedEphemeral
                }
            ]}
            notice={notice ? { message: notice, type: "critical" } : undefined}
        >
            <Flex flexDirection="column" gap={12}>
                <section>
                    <TextInput label="Name" value={name} onChange={setName} placeholder="greet" />
                </section>

                <section>
                    <TextArea label="Response" value={message} onChange={setMessage} placeholder={EXAMPLE_RESPONSE} />
                </section>

                {detectedArguments.length > 0 && (
                    <section>
                        <HeadingSecondary>Detected Arguments</HeadingSecondary>
                        <Paragraph>
                            <ul>
                                {detectedArguments.map(arg => (
                                    <li key={arg.name}>
                                        &mdash; <b>{arg.name}</b>{arg.defaultValue ? ` (default: ${arg.defaultValue})` : ""}
                                    </li>
                                ))}
                            </ul>
                        </Paragraph>
                    </section>
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
