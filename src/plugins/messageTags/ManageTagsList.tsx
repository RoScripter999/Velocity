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

import { classNameFactory } from "@utils/css";
import type { PluginSettingComponentProps } from "@utils/types";
import { Buttons, Icons, Text } from "@webpack/common";

import { openCreateTagModal } from "./CreateTagModal";
import { removeTag, settings } from "./settings";

export const cl = classNameFactory("vc-customCommands-");

export function ManageTagsList({ isModal = false }: Partial<PluginSettingComponentProps> & { isModal?: boolean; }) {
    const { tagsList } = settings.use(["tagsList"]);
    const tags = Object.entries(tagsList);

    return (
        <div className={cl("container")}>
            {tags.length > 0 ? tags.map(([name, message]) => (
                <div key={name} className={cl("row")}>
                    <div className={cl("rowContent")}>
                        <Text variant="text-md/semibold">{name}</Text>
                        <Text variant="text-sm/normal" color="text-muted">{message}</Text>
                    </div>

                    <div className={cl("rowActions")}>
                        <Buttons.IconButton size="sm" variant="secondary" icon={Icons.PencilIcon} onClick={() => openCreateTagModal({ name, message })} />
                        <Buttons.IconButton size="sm" variant="critical-secondary" icon={Icons.TrashIcon} onClick={() => removeTag(name)} />
                    </div>
                </div>
            )) : <Text color="text-muted" className={cl("empty")}>No custom commands yet. Create one to get started!</Text>}
            {!isModal && <Buttons.Button size="sm" text="Create Tag" onClick={() => openCreateTagModal()} />}
        </div>
    );
}
