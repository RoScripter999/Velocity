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

import { unregisterCommand } from "@api/Commands";
import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { registerTagCommand } from ".";
import { ManageTagsList } from "./ManageTagsList";

export const settings = definePluginSettings({
    tagsList: {
        type: OptionType.CUSTOM,
        default: {} as Record<string, Tag>
    },
    tagComponent: {
        type: OptionType.COMPONENT,
        component: ManageTagsList
    }
});

export interface Tag {
    name: string;
    message: string;
}

export function getTags() {
    return Object.values(settings.store.tagsList);
}

export function getTag(name: string) {
    return settings.store.tagsList[name];
}

export function addTag(tag: Tag) {
    unregisterCommand(tag.name);

    settings.store.tagsList[tag.name] = tag;
    registerTagCommand(tag);
}

export function removeTag(name: string) {
    delete settings.store.tagsList[name];
    unregisterCommand(name);
}
