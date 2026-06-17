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

import type { SidebarItemNode } from "@velocity-types";
import { LayoutType } from "@velocity-types/enums";
import { Icons } from "@webpack/common";

import PatchHelper from "./PatchHelper";
import SearchHelper from "./SearchHelper";

const Helpers = () => ({
    key: "velocity_helper",
    type: LayoutType.SIDEBAR_ITEM,
    icon: Icons.WrenchIcon,
    useTitle: () => "Helpers",
    buildLayout: () => [
        {
            key: "velocity_helper_panel",
            type: LayoutType.PANEL,
            useTitle: () => "Helpers",
            buildLayout: () => [
                {
                    key: "search_helper",
                    type: LayoutType.TAB_ITEM,
                    getTitle: () => "Search Helper",
                    layout: [{
                        type: LayoutType.CUSTOM,
                        Component: SearchHelper
                    }]
                },
                {
                    key: "patch_helper",
                    type: LayoutType.TAB_ITEM,
                    getTitle: () => "Patch Helper",
                    layout: [{
                        type: LayoutType.CUSTOM,
                        Component: PatchHelper
                    }]
                }
            ]
        }
    ]
}) as SidebarItemNode;

export default IS_DEV ? Helpers : null;
