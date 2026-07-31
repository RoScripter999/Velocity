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

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { CodeBlock } from "@components/CodeBlock";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { copyWithToast } from "@utils/discord";
import definePlugin from "@utils/types";
import type { Message } from "@velocity-types";
import { Forms, Icons, Menu, Modal, openModal } from "@webpack/common";

import { copyEmbedContent, CopyType, toEmbedJson } from "./utils";

function openEmbedRawModal(msg: Message) {
    const cleanEmbeds = msg.embeds.map(toEmbedJson);
    const embedJson = JSON.stringify({ content: null, embeds: cleanEmbeds, attachments: [] }, null, 4);

    openModal(props => (
        <Modal {...props} size="lg" title="View Raw Embeds" actions={[
            {
                text: "Copy All Embeds JSON",
                onClick: () => copyWithToast(embedJson, "All embed data copied to clipboard!")
            }
        ]}>
            <div>
                {cleanEmbeds.map((embed, index) => (
                    <>
                        {index > 0 && <Forms.FormDivider gap={18} />}
                        <Forms.FormTitle>
                            Embed {index + 1} Data
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
                        <Forms.FormDivider gap={18} />
                        <Forms.FormTitle>
                            All Embeds Combined
                        </Forms.FormTitle>
                        <CodeBlock
                            content={embedJson}
                            lang="json"
                            className={Margins.bottom20}
                        />
                    </>
                )}
            </div>
        </Modal>
    ));
}

const messageContextCallback: NavContextMenuPatchCallback = (children, { message }: { message: Message; }) => {
    // discord.js sends the "type" on the embed, its the only thing
    // that is on an actual discord embed. thus this will check if the menu should appear.
    if (!message.embeds.length) return;
    if (!message.embeds.some(props => props.type === "rich")) return;

    const group = findGroupChildrenByChildId("copy-link", children);
    if (!group) return;

    const embedsWithDesc = message.embeds.map((e, i) => e.rawDescription ? i : -1).filter(i => i !== -1);
    const hasMultipleDesc = embedsWithDesc.length > 1;

    group.push(
        <Menu.MenuItem id="vc-embed-data" label="Embed Data" leadingAccessory={{ type: "icon", icon: Icons.EmbedIcon }}>
            <Menu.MenuItem
                id="data"
                label="Copy Embed Data"
                action={() => copyEmbedContent(message, CopyType.EMBED)}
                icon={Icons.AngleBracketsIcon}
                leadingAccessory={{ type: "icon", icon: Icons.AngleBracketsIcon }}
            />
            <Menu.MenuSeparator />
            {hasMultipleDesc ? (
                <Menu.MenuItem
                    id="vc-copy-embed-description"
                    label="Copy Embed Description"
                    leadingAccessory={{ type: "icon", icon: Icons.CopyIcon }}
                >
                    {embedsWithDesc.map(i => (
                        <Menu.MenuItem
                            key={i}
                            id={`desc-${i}`}
                            label={`Copy Embed ${i + 1} Description`}
                            action={() => copyEmbedContent(message, CopyType.DESCRIPTION, i)}
                            icon={Icons.CopyIcon}
                            leadingAccessory={{ type: "icon", icon: Icons.CopyIcon }}
                        />
                    ))}
                </Menu.MenuItem>
            ) : embedsWithDesc[0] !== undefined ? (
                <Menu.MenuItem
                    id="vc-copy-embed-description"
                    label="Copy Embed Description"
                    action={() => copyEmbedContent(message, CopyType.DESCRIPTION, embedsWithDesc[0])}
                    icon={Icons.CopyIcon}
                    leadingAccessory={{ type: "icon", icon: Icons.CopyIcon }}
                />
            ) : null}
            <Menu.MenuSeparator />
            <Menu.MenuItem
                id="vc-view-raw-embed"
                label="View Raw Embed"
                action={() => openEmbedRawModal(message)}
                icon={Icons.TopicsIcon}
                leadingAccessory={{ type: "icon", icon: Icons.TopicsIcon }}
            />
        </Menu.MenuItem>
    );
};

export default definePlugin({
    name: "CopyEmbed",
    description: "Copy embeds structure, descriptions, and generate EmbedBuilder code.",
    tags: ["Utility", "Developers"],
    authors: [Devs.RoScripter999],

    contextMenus: {
        "message": { render: messageContextCallback, required: true }
    }
});
