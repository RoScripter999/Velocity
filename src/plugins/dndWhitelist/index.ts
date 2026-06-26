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
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { PresenceStore, UserStore } from "@webpack/common";

const settings = definePluginSettings({
    whitelistedUserIds: {
        type: OptionType.STRING,
        description: "Comma-separated user IDs to always notify, even in Do Not Disturb.",
        default: ""
    }
});

export default definePlugin({
    name: "DNDWhitelist",
    description: "Receive notifications from whitelisted users even in Do Not Disturb.",
    authors: [Devs.RoScripter999],
    settings,

    patches: [{
        find: '"NotificationStore"',
        replacement: {
            match: /let (\i)=(\(0,\i\.\i\)\((\i),\i,!\i\))/,
            replace: "let $1=$self.shouldNotify($2,$3)"
        }
    }],

    shouldNotify(result: boolean, message: Message): boolean {
        if (result) return true;
        if (PresenceStore.getStatus(UserStore.getCurrentUser()?.id) !== "dnd") return false;
        return settings.store.whitelistedUserIds.split(",").some(s => s.trim() === message.author.id);
    }
});
