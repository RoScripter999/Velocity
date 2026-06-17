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

import "./styles.css";

import type { SidebarItemNode } from "@velocity-types";
import { LayoutType } from "@velocity-types/enums";
import { Icons } from "@webpack/common";

import TestTab from "./gay";
import IconCreator from "./IconCreator";
import IconsTab from "./IconsPreview";

const DevTools = () => ({
    key: "velocity_developer_tools",
    type: LayoutType.SIDEBAR_ITEM,
    parent: {},
    icon: Icons.ScienceIcon,
    useTitle: () => "Developer Tools",
    buildLayout: () => [
        {
            key: "velocity_developer_tools_panel",
            type: LayoutType.PANEL,
            useTitle: () => "Developer Tools",
            buildLayout: () => [
                {
                    key: "icons_preview",
                    type: LayoutType.TAB_ITEM,
                    getTitle: () => "Icons Preview",
                    layout: [{
                        type: LayoutType.CUSTOM,
                        Component: IconsTab
                    }]
                },
                {
                    key: "icon_creator",
                    type: LayoutType.TAB_ITEM,
                    getTitle: () => "Icon Creator",
                    layout: [{
                        type: LayoutType.CUSTOM,
                        Component: IconCreator
                    }]
                },
                {
                    key: "gay",
                    type: LayoutType.TAB_ITEM,
                    getTitle: () => "GAY",
                    layout: [{
                        type: LayoutType.CUSTOM,
                        Component: TestTab
                    }]
                }
            ]
        }
    ]
}) as SidebarItemNode;

export default IS_DEV ? DevTools : null;
