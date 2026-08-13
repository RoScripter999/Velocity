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
import { TabBar, useState } from "@webpack/common";

import PatchHelper from "./PatchHelper";
import SearchHelper from "./SearchHelper";

const enum Tabs {
    PATCH_HELPER,
    SEARCH_HELPER
}

export default IS_DEV ? function Helpers() {
    const [currentTab, setCurrentTab] = useState(Tabs.PATCH_HELPER);

    return (
        <SettingsTab>
            <TabBar
                type="top"
                look="brand"
                selectedItem={currentTab}
                onItemSelect={setCurrentTab}
                className={Margins.bottom20}
            >
                <TabBar.Item id={Tabs.PATCH_HELPER}>
                    Patch Helper
                </TabBar.Item>
                <TabBar.Item id={Tabs.SEARCH_HELPER}>
                    Search Helper
                </TabBar.Item>
            </TabBar>

            <main>
                {currentTab === Tabs.PATCH_HELPER && IS_DEV && <PatchHelper />}
                {currentTab === Tabs.SEARCH_HELPER && IS_DEV && <SearchHelper />}
            </main>
        </SettingsTab>
    );
} : null;
