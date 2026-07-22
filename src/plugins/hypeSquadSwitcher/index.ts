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

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { ApplicationCommandInputType, ApplicationCommandOptionType } from "@velocity-types/enums";
import { RestAPI } from "@webpack/common";

export default definePlugin({
    name: "HypeSquadSwitcher",
    description: "Change, join, or leave your HypeSquad badge",
    authors: [Devs.RoScripter999],

    commands: [
        {
            name: "hypesquad",
            description: "Manage your HypeSquad badge",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    name: "badge",
                    description: "Choose a HypeSquad or leave.",
                    type: ApplicationCommandOptionType.NUMBER,
                    required: true,
                    choices: [
                        { name: "Bravery", value: 1 },
                        { name: "Brilliance", value: 2 },
                        { name: "Balance", value: 3 },
                        { name: "Leave HypeSquad (you wont lose badge)", value: 0 }
                    ]
                }
            ],
            execute: async interaction => {
                const badge = interaction.options.getNumber("badge", true) as 0 | 1 | 2 | 3;

                if (badge === 0) {
                    await RestAPI.del({ url: "/hypesquad/online" });
                    return void interaction.reply({ content: "You have left HypeSquad." });
                }
                await RestAPI.post({
                    url: "/hypesquad/online",
                    body: { house_id: badge }
                });

                void interaction.reply({ content: "Successfully changed HypeSquad" });
            }
        }
    ]
});
