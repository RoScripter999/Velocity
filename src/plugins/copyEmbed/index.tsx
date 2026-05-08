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

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { CodeBlock } from "@components/CodeBlock";
import ErrorBoundary from "@components/ErrorBoundary";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { copyWithToast } from "@utils/discord";
import { classes } from "@utils/misc";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import type { Embed, Message } from "@velocity-types";
import { Buttons, CMIconClasses, Forms, Icons, Menu, Text } from "@webpack/common";

import { cleanEmbed, copyEmbedContent } from "./utils";

function openEmbedRawModal(msg: Message) {
    const cleanEmbeds = msg.embeds.map(cleanEmbed);
    const embedJson = JSON.stringify({ content: null, embeds: cleanEmbeds, attachments: [] }, null, 4);

    openModal(props => (
        <ErrorBoundary>
            <ModalRoot {...props} size={ModalSize.MEDIUM}>
                <ModalHeader>
                    <Text className={Margins.bottom16} tag="h3" variant="text-md/semibold" style={{ flexGrow: 1 }}>View Raw Embeds</Text>
                    <ModalCloseButton onClick={props.onClose} />
                </ModalHeader>
                <ModalContent>
                    {cleanEmbeds.map((embed, i) => (
                        <>
                            {i > 0 && (
                                <Forms.FormDivider
                                    className={`${Margins.top16} ${Margins.bottom20}`}
                                />
                            )}
                            <Forms.FormTitle tag="h5">
                                Embed {i + 1} Data
                            </Forms.FormTitle>
                            <CodeBlock
                                content={JSON.stringify(embed, null, 4)}
                                lang="json"
                                className={Margins.bottom20}
                            />
                        </>
                    ))}

                    {cleanEmbeds.length > 1 && (
                        <>
                            <Forms.FormDivider className={classes(Margins.top16, Margins.bottom20)} />
                            <Forms.FormTitle tag="h5">
                                All Embeds Combined
                            </Forms.FormTitle>
                            <CodeBlock
                                content={embedJson}
                                lang="json"
                                className={Margins.bottom20}
                            />
                        </>
                    )}
                </ModalContent>
                <ModalFooter>
                    <Buttons.Button
                        text="Copy All Embeds JSON"
                        onClick={() => copyWithToast(embedJson, "All embed data copied to clipboard!")}
                    />
                </ModalFooter>
            </ModalRoot>
        </ErrorBoundary>
    ));
}

const messageContextCallback: NavContextMenuPatchCallback = (children, props) => {
    // discord.js sends the "type" on the embed, its the only thing
    // that is on an actual discord embed. thus this will check if the menu should appear.
    if (!props.message.embeds.length) return;
    if (!props.message.embeds.some((props: Embed) => props.type === "rich")) return;

    const group = findGroupChildrenByChildId("copy-link", children);

    if (group) {
        group.push(
            <Menu.MenuItem
                id="vc-embed-data"
                label="Embed Data"
            >
                <Menu.MenuItem
                    id="data"
                    label="Copy Embed Data"
                    action={() => copyEmbedContent(props.message, "embed")}
                    icon={() => <Icons.AngleBracketsIcon className={CMIconClasses.icon} />}
                />
                <Menu.MenuItem
                    id="full"
                    label="Copy Full JSON"
                    action={() => copyEmbedContent(props.message, "full")}
                    icon={() => <Icons.TopicsIcon className={CMIconClasses.icon} />}
                />
                <Menu.MenuSeparator />
                {props.message.embeds.filter((e: Embed) => e.rawDescription).length > 1 ? (
                    <Menu.MenuItem
                        id="vc-copy-embed-description"
                        label="Copy Embed Description"
                    >
                        {props.message.embeds.map((embed: Embed, i: number) =>
                            embed.rawDescription ? (
                                <Menu.MenuItem
                                    key={i}
                                    id={`desc-${i}`}
                                    label={`Copy Embed ${i + 1} Description`}
                                    action={() => copyEmbedContent(props.message, "description", i)}
                                    icon={() => <Icons.ClipboardListIcon className={CMIconClasses.icon} />}
                                />
                            ) : null
                        )}
                    </Menu.MenuItem>
                ) : props.message.embeds[0]?.rawDescription ? (
                    <Menu.MenuItem
                        id="vc-copy-embed-description"
                        label="Copy Embed Description"
                        action={() => copyEmbedContent(props.message, "description", 0)}
                        icon={() => <Icons.ClipboardListIcon className={CMIconClasses.icon} />}
                    />
                ) : null}
                <Menu.MenuItem
                    id="vc-copy-embed-builder"
                    label="Copy EmbedBuilder"
                    action={() => copyEmbedContent(props.message, "builder")}
                    icon={() => <Icons.CopyIcon className={CMIconClasses.icon} />}
                />
                <Menu.MenuSeparator />
                <Menu.MenuItem
                    id="vc-view-raw-embed"
                    label="View Raw Embed"
                    action={() => openEmbedRawModal(props.message)}
                    icon={() => <Icons.TopicsIcon className={CMIconClasses.icon} />}
                />
            </Menu.MenuItem>
        );
    }
};

export default definePlugin({
    name: "CopyEmbed",
    description: "Copy embeds structure, descriptions, and generate EmbedBuilder code.",
    tags: ["Utility", "Developers", "Commands"],
    authors: [Devs.RoScripter999],

    contextMenus: {
        "message": { render: messageContextCallback, required: true }
    }
});
