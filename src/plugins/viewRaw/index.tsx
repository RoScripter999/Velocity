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

import type { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { CodeBlock } from "@components/CodeBlock";
import ErrorBoundary from "@components/ErrorBoundary";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { copyWithToast, getCurrentGuild, getIntlMessage } from "@utils/discord";
import { isTruthy } from "@utils/guards";
import definePlugin from "@utils/types";
import type { Message, User } from "@velocity-types";
import { ChannelStore, Forms, GuildRoleStore, Icons, Menu, Modal, openModal, PopoverClasses } from "@webpack/common";

function sortObject<T extends object>(obj: T): T {
    return Object.fromEntries(Object.entries(obj).sort(([k1], [k2]) => k1.localeCompare(k2))) as T;
}

function cleanMessage(msg: Message) {
    const clone = sortObject(JSON.parse(JSON.stringify(msg)));
    for (const key of ["email", "phone", "mfaEnabled", "personalConnectionId"])
        delete clone.author[key];

    const cloneAny = clone;
    delete cloneAny.editHistory;
    delete cloneAny.deleted;
    delete cloneAny.firstEditTimestamp;
    cloneAny.attachments?.forEach((a: any) => delete a.deleted);

    return clone;
}

function cleanUser(user: User) {
    const clone = sortObject(JSON.parse(JSON.stringify(user)));
    for (const key of ["email", "phone", "mfaEnabled", "personalConnectionId"])
        delete clone[key];

    return clone;
}

function openViewRawModal(json: string, type: string, msgContent?: string) {
    void openModal(props => (
        <ErrorBoundary>
            <Modal
                {...props}
                title="View Raw"
                size="xl"
                actions={[
                    {
                        text: `Copy ${type} JSON`,
                        variant: "primary",
                        onClick: () => copyWithToast(json, `${type} data copied to clipboard!`)
                    },
                    msgContent && {
                        text: "Copy Raw Content",
                        variant: "secondary" as any,
                        onClick: () => copyWithToast(msgContent, "Content copied to clipboard!")
                    }
                ].filter(isTruthy)}
            >
                {!!msgContent && (
                    <>
                        <Forms.FormTitle tag="h5">Content</Forms.FormTitle>
                        <CodeBlock content={msgContent} />
                        <Forms.FormDivider className={Margins.bottom20} />
                    </>
                )}

                <Forms.FormTitle tag="h5">{type} Data</Forms.FormTitle>
                <CodeBlock content={json} lang="json" />
            </Modal>
        </ErrorBoundary >
    ));
}

const messageContextCallback: NavContextMenuPatchCallback = (children, props) => {
    if (!props?.message) return;

    children.push(
        <Menu.MenuItem
            id="vc-view-message-raw"
            label="View Raw"
            action={() => openViewRawModal(JSON.stringify(props.message, null, 4), "Message", props.message.content)}
            icon={Icons.TopicsIcon}
            leadingAccessory={{ type: "icon", icon: Icons.TopicsIcon }}
        />
    );
};

function MakeContextCallback(name: "Guild" | "Role" | "User" | "Channel"): NavContextMenuPatchCallback {
    return (children, props) => {
        const value = props[name.toLowerCase()];
        if (!value) return;
        if (props.label === getIntlMessage("CHANNEL_ACTIONS_MENU_LABEL")) return;

        const lastChild = children.at(-1);
        if (lastChild?.key === "developer-actions") {
            const p = lastChild.props;
            if (!Array.isArray(p.children)) p.children = [p.children];
            children = p.children;
        }

        children.splice(-1, 0,
            <Menu.MenuItem
                id={`vc-view-${name.toLowerCase()}-raw`}
                label="View Raw"
                icon={Icons.TopicsIcon}
                leadingAccessory={{ type: "icon", icon: Icons.TopicsIcon }}
                action={() => {
                    if (name === "User") {
                        openViewRawModal(JSON.stringify(cleanUser(value), null, 4), "User");
                    } else {
                        openViewRawModal(JSON.stringify(value, null, 4), name);
                    }
                }}
            />
        );
    };
}

const devContextCallback: NavContextMenuPatchCallback = (children, { id }: { id: string; }) => {
    const guild = getCurrentGuild();
    if (!guild) return;

    const role = GuildRoleStore.getRole(guild.id, id);
    if (!role) return;

    children.push(
        <Menu.MenuItem
            id="vc-view-role-raw"
            label="View Raw"
            action={() => openViewRawModal(JSON.stringify(role, null, 4), "Role")}
            icon={Icons.TopicsIcon}
            leadingAccessory={{ type: "icon", icon: Icons.TopicsIcon }}
        />
    );
};

export default definePlugin({
    name: "ViewRaw",
    description: "Copy and view the raw content/data of any message, user, channel or guild",
    authors: [Devs.KingFish, Devs.Ven, Devs.rad, Devs.ImLvna, Devs.RoScripter999],
    contextMenus: {
        "guild-context": { render: MakeContextCallback("Guild"), required: true },
        "guild-settings-role-context": { render: MakeContextCallback("Role"), required: true },
        "channel-context": { render: MakeContextCallback("Channel"), required: true },
        "thread-context": { render: MakeContextCallback("Channel"), required: true },
        "message": { render: messageContextCallback, required: true },
        "gdm-context": { render: MakeContextCallback("Channel"), required: true },
        "user-context": { render: MakeContextCallback("User"), required: true },
        "dev-context": { render: devContextCallback, required: true }
    },

    messagePopoverButton: {
        icon: () => <Icons.AngleBracketsIcon color="currentColor" size="refresh_sm" />,
        render(msg) {
            return {
                label: "View Raw",
                icon: () => <Icons.AngleBracketsIcon color="currentColor" className={PopoverClasses.icon} />,
                message: msg,
                channel: ChannelStore.getChannel(msg.channel_id),
                onClick: () => openViewRawModal(JSON.stringify(cleanMessage(msg), null, 4), "Message", msg.content),
                onContextMenu: e => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyWithToast(msg.content);
                }
            };
        }
    }
});
