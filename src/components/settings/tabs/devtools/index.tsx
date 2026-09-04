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
import { Tabs, useState } from "@webpack/common";
import type { ComponentType } from "react";

import TestTab from "./gay";
import IconCreator from "./IconCreator";
import IconsTab from "./IconsPreview";

const enum PanelTabs {
    ICONS,
    CREATOR,
    GAY
}

export default !IS_STANDALONE ? function DevTools() {
    const [currentTab, setCurrentTab] = useState(PanelTabs.ICONS);

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
                        id: PanelTabs.ICONS,
                        label: "Icons Preview",
                        panel: () => wrapTab(IconsTab)
                    },
                    {
                        id: PanelTabs.CREATOR,
                        label: "Icon Creator",
                        panel: () => wrapTab(IconCreator)
                    },
                    {
                        id: PanelTabs.GAY,
                        label: "GAY",
                        panel: () => wrapTab(TestTab)
                    }
                ]}
                selectedId={currentTab}
                onChange={setCurrentTab}
            />
        </SettingsTab>
    );
} : null;
