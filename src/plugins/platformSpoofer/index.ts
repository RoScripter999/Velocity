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

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { UserStore } from "@webpack/common";

const settings = definePluginSettings({
    platform: {
        type: OptionType.SELECT,
        description: "What platform to show up as on",
        restartNeeded: true,
        options: [
            {
                label: "Desktop",
                value: "desktop",
                default: true
            },
            {
                label: "Web",
                value: "web"
            },
            {
                label: "Android",
                value: "android"
            },
            {
                label: "iOS",
                value: "ios"
            },
            {
                label: "Xbox",
                value: "xbox"
            }
        ]
    }
});

const platformMap = {
    desktop: { browser: "Discord Client", vcIcon: 0, client: "desktop" },
    web: { browser: "Discord Web", vcIcon: 0, client: "web" },
    ios: { browser: "Discord iOS", vcIcon: 1, client: "ios" },
    android: { browser: "Discord Android", vcIcon: 1, client: "android" },
    xbox: { browser: "Discord Embedded", vcIcon: 2, client: "xbox" }
};

export default definePlugin({
    name: "PlatformSpoofer",
    description: "Spoof what platform or device you're on",
    tag: ["Fun", "Utility", "Privacy"],
    authors: [Devs.RoScripter999],

    settings,

    patches: [
        {
            find: "_doIdentify(){",
            replacement: [
                {
                    match: /window._ws=null,null!=\i/,
                    replace: "false"
                },
                {
                    match: /(?<="GatewaySocket"\)\}\),properties:)(\i)/,
                    replace: "{...$1,...$self.getPlatform(true)}"
                }
            ]
        },
        {
            find: '"2025-01-virtual-currency-rollout"',
            replacement: [
                {
                    match: /(?<=\}\),)(\i)/g,
                    replace: "$1=e=>({enabled:true}),_equicord_$1"
                }
            ]
        }
    ],

    getPlatform(bypass: boolean, userId?: string) {
        const platform = settings.store.platform ?? "desktop";

        if (bypass || userId === UserStore.getCurrentUser().id) {
            return platformMap[platform] || null;
        }

        return null;
    }
});
