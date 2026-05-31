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
import { Icons, Menu } from "@webpack/common";

import { addChannelToCategory, canMoveChannelInDirection, currentUserCategories, isPinned, moveChannel, moveChannelToCategory, removeChannelFromCategory } from "../data";
import { PinOrder, settings } from "../index";
import { openCategoryModal } from "./CreateCategoryModal";

function createPinMenuItem(channelId: string) {
    const pinned = isPinned(channelId);
    const hasCategories = currentUserCategories.length > 0;

    return (
        <Menu.MenuItem
            id="pin-dm"
            label="Pin DMs"
        >
            {!pinned && (
                <>
                    <Menu.MenuItem
                        id="vc-add-category"
                        label="Add Category"
                        icon={() => <Icons.PlusLargeIcon color="currentColor" />}
                        color="brand"
                        action={() => openCategoryModal(null, channelId)}
                    />
                    {hasCategories && <Menu.MenuSeparator />}
                    {hasCategories && currentUserCategories.map(category => (
                        <Menu.MenuItem
                            key={category.id}
                            id={`pin-category-${category.id}`}
                            label={category.name}
                            action={() => addChannelToCategory(channelId, category.id)}
                        />
                    ))}
                </>
            )}

            {pinned && (
                <>
                    <Menu.MenuItem
                        id="move-dm"
                        label="Move DM"
                    >
                        <Menu.MenuItem
                            id="vc-add-category"
                            label="Add Category"
                            color="brand"
                            action={() => openCategoryModal(null, channelId)}
                        />
                        <Menu.MenuSeparator />
                        {

                            currentUserCategories.filter(c => !c.channels.includes(channelId)).
                                map(category => (
                                    <Menu.MenuItem
                                        key={category.id}
                                        id={`pin-category-${category.id}`}
                                        label={category.name}
                                        action={() => moveChannelToCategory(channelId, category.id)}
                                    />
                                ))
                        }

                    </Menu.MenuItem>

                    <Menu.MenuSeparator />

                    <Menu.MenuItem
                        id="unpin-dm"
                        label="Unpin DM"
                        icon={() => <Icons.TrashIcon color="currentColor" />}
                        color="danger"
                        action={() => removeChannelFromCategory(channelId)}
                    />

                    {settings.store.pinOrder === PinOrder.Custom && canMoveChannelInDirection(channelId, -1) && (
                        <Menu.MenuItem
                            id="move-up"
                            label="Move Up"
                            action={() => moveChannel(channelId, -1)}
                        />
                    )}

                    {settings.store.pinOrder === PinOrder.Custom && canMoveChannelInDirection(channelId, 1) && (
                        <Menu.MenuItem
                            id="move-down"
                            label="Move Down"
                            action={() => moveChannel(channelId, 1)}
                        />
                    )}
                </>
            )}
        </Menu.MenuItem>
    );
}


const GroupDMContext: NavContextMenuPatchCallback = (children, props) => {
    const container = findGroupChildrenByChildId("leave-channel", children);
    container?.unshift(createPinMenuItem(props.channel.id));
};

const UserContext: NavContextMenuPatchCallback = (children, props) => {
    const container = findGroupChildrenByChildId("close-dm", children);
    if (container) {
        const idx = container.findIndex(c => c?.props?.id === "close-dm");
        container.splice(idx, 0, createPinMenuItem(props.channel.id));
    }
};

export const contextMenus = {
    "gdm-context": { render: GroupDMContext, required: true },
    "user-context": { render: UserContext, required: true }
};
