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

import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { SectionHeader, SettingsTab } from "@components/settings";
import { Icons, TabBar, useState } from "@webpack/common";

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
            <SectionHeader
                title="Development utilities"
                description="Tools to help you develop and create new stuff to Velocity"
                tag="h2"
                margin="bottom16"
            />

            <TabBar
                type="side"
                look="grey"
                className={Margins.bottom20}
                selectedItem={currentTab}
                onItemSelect={setCurrentTab}
            >
                <TabBar.Item id={Tabs.PATCH_HELPER}>
                    <Flex gap="8px" alignItems="center">
                        <Icons.HammerIcon size="sm" color="currentColor" />
                        Patch Helper
                    </Flex>
                </TabBar.Item>
                <TabBar.Item id={Tabs.SEARCH_HELPER}>
                    <Flex gap="8px" alignItems="center">
                        <Icons.MagnifyingGlassIcon size="sm" color="currentColor" />
                        Search Helper
                    </Flex>
                </TabBar.Item>
            </TabBar>

            {currentTab === Tabs.PATCH_HELPER && IS_DEV && <PatchHelper />}
            {currentTab === Tabs.SEARCH_HELPER && IS_DEV && <SearchHelper />}
        </SettingsTab>
    );
} : null;
