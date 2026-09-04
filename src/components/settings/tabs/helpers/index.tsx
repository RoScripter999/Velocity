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

import { Margins } from "@components/margins";
import { SettingsTab } from "@components/settings";
import { Tabs, useState } from "@webpack/common";
import type { ComponentType } from "react";

import PatchHelper from "./PatchHelper";
import SearchHelper from "./SearchHelper";

const enum PanelTabs {
    PATCH_HELPER,
    SEARCH_HELPER
}

export default !IS_STANDALONE ? function Helpers() {
    const [currentTab, setCurrentTab] = useState(PanelTabs.PATCH_HELPER);

    function wrapTab(Tab: ComponentType<any>) {
        return (
            <main className={Margins.top20}>
                <Tab />
            </main>
        );
    }

    return (
        <SettingsTab>
            <Tabs
                items={[
                    {
                        id: PanelTabs.PATCH_HELPER,
                        label: "Patch Helper",
                        panel: () => wrapTab(PatchHelper)
                    },
                    {
                        id: PanelTabs.SEARCH_HELPER,
                        label: "Search Helper",
                        panel: () => wrapTab(SearchHelper)
                    }
                ]}
                selectedId={currentTab}
                onChange={setCurrentTab}
            />
        </SettingsTab>
    );
} : null;
