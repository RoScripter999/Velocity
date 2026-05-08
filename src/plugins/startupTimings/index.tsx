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

import SettingsPlugin from "@plugins/_core/settings";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Icons } from "@webpack/common";

import StartupTimingPage from "./StartupTimingPage";

export default definePlugin({
    name: "StartupTimings",
    description: "Adds Startup Timings to the Settings menu",
    tags: ["Developers"],
    authors: [Devs.Megu],
    start() {
        SettingsPlugin.customEntries.push(
            SettingsPlugin.buildEntry({
                key: "velocity_startup_timings",
                title: "Startup Timings",
                Component: StartupTimingPage,
                Icon: Icons.ClockIcon
            })
        );
    },
    stop() {
        function removeFromArray<T>(arr: T[], predicate: (e: T) => boolean) {
            const idx = arr.findIndex(predicate);
            if (idx !== -1) arr.splice(idx, 1);
        }
        removeFromArray(SettingsPlugin.customEntries, e => e.key === "velocity_startup_timings");
    }
});
