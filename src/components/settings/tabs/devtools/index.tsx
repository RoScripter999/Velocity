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

import { Margins } from "@components/margins";
import { SettingsTab } from "@components/settings";
import { TabBar, useState } from "@webpack/common";

import TestTab from "./gay";
import IconCreator from "./IconCreator";
import IconsTab from "./IconsPreview";

const enum DevTab {
    ICONS,
    CREATOR,
    GAY
}

export default !IS_STANDALONE ? function DevTools() {
    const [currentTab, setCurrentTab] = useState(DevTab.ICONS);

    return (
        <SettingsTab>
            <TabBar
                type="top"
                look="brand"
                selectedItem={currentTab}
                onItemSelect={setCurrentTab}
                className={Margins.bottom20}
            >
                <TabBar.Item id={DevTab.ICONS}>
                    Icons Preview
                </TabBar.Item>
                <TabBar.Item id={DevTab.CREATOR}>
                    Icon Creator
                </TabBar.Item>
                <TabBar.Item id={DevTab.GAY}>
                    GAY
                </TabBar.Item>
            </TabBar>

            <main>
                {currentTab === DevTab.ICONS && <IconsTab />}
                {currentTab === DevTab.CREATOR && <IconCreator />}
                {currentTab === DevTab.GAY && <TestTab />}
            </main>
        </SettingsTab>
    );
} : null;
