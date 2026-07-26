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

import { definePluginSettings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { UserSettingsProtoStore } from "@webpack/common";

let savedStatus: string | null;

const StatusSettings = getUserSettingLazy<string>("status", "status")!;

const settings = definePluginSettings({
    statusToSet: {
        type: OptionType.SELECT,
        description: "Status to set while playing a game",
        options: [
            {
                label: "Online",
                value: "online"
            },
            {
                label: "Idle",
                value: "idle"
            },
            {
                label: "Do Not Disturb",
                value: "dnd",
                default: true
            },
            {
                label: "Invisible",
                value: "invisible"
            }
        ]
    }
});

let lastStatus: string | null = null;

function handleUserSettingsChange() {
    const status = StatusSettings.getSetting();
    if (status !== lastStatus) {
        lastStatus = status;

        savedStatus = null;
    }
}

async function setStatus(status: string) {
    lastStatus = status;
    await StatusSettings.updateSetting(status);
}


export default definePlugin({
    name: "AutoDNDWhilePlaying",
    description: "Automatically updates your online status (online, idle, dnd) when launching games",
    tags: ["Activity", "Utility"],
    authors: [Devs.thororen],
    settings,

    flux: {
        async RUNNING_GAMES_CHANGE({ games }) {
            const status = StatusSettings.getSetting();

            if (games.length > 0) {
                if (status !== settings.store.statusToSet && status !== "invisible") {
                    savedStatus = status;
                    await setStatus(settings.store.statusToSet);
                }
            } else if (savedStatus) {
                const toRestore = savedStatus;
                savedStatus = null;

                if (status !== toRestore) {
                    await setStatus(toRestore);
                }
            }
        }
    },

    start() {
        lastStatus = StatusSettings.getSetting();
        UserSettingsProtoStore.addChangeListener(handleUserSettingsChange);
    },

    stop() {
        UserSettingsProtoStore.removeChangeListener(handleUserSettingsChange);
    }
});
