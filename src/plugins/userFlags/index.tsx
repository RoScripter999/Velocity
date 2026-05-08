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

import { ApplicationCommandInputType, ApplicationCommandOptionType, findOption, sendBotMessage } from "@api/Commands";
import { get, set } from "@api/DataStore";
import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Parser, Text } from "@webpack/common";

interface FlagEntry {
    text: string;
    color?: string;
}

type Flag = Record<string, FlagEntry>;

let userFlags: Flag = {};

const KEY = "vc-userflags";

function UserFlag({ id }: { id: string; }) {
    const flag = userFlags[id];
    if (!flag) return null;

    return (
        <div style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px" }}>
            <Text variant="text-md/bold" style={{ color: flag?.color }}>
                {Parser.parse(flag.text)}
            </Text>
        </div>
    );
}

export default definePlugin({
    name: "UserFlags",
    description: "Add custom flags to users in messages",
    tags: ["Chat", "Fun", "Friends", "Appearance"],
    authors: [Devs.RoScripter999],
    dependencies: ["MessageDecorationsAPI"],

    async start() {
        const saved = await get(KEY);
        if (saved) {
            userFlags = typeof saved === "string" ? JSON.parse(saved) : saved;
        }

        addMessageDecoration("user-flags", props => {
            return props.message?.author ? <UserFlag id={props.message.author.id} /> : null;
        });
    },

    stop() {
        removeMessageDecoration("user-flags");
    },

    commands: [
        {
            name: "userflag",
            description: "Add or remove flags on users",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    name: "set",
                    description: "Set a flag on a user",
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionType.USER,
                            description: "User to flag",
                            required: true
                        },
                        {
                            name: "text",
                            type: ApplicationCommandOptionType.STRING,
                            description: "Flag text",
                            required: true
                        },
                        {
                            name: "color",
                            type: ApplicationCommandOptionType.STRING,
                            description: "Hex color",
                            required: false
                        }
                    ]
                },
                {
                    name: "remove",
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    description: "Remove flag from user",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionType.USER,
                            description: "User to remove flag from",
                            required: true
                        }
                    ]
                }
            ],
            execute: async (args, ctx) => {
                const subcommand = args[0]?.name;
                const userId = findOption(args[0].options, "user") as string;

                switch (subcommand) {
                    case "set": {
                        const text = findOption(args[0].options, "text") as string;
                        const color = findOption(args[0].options, "color") as string | undefined;

                        userFlags[userId] = { text, ...(color && { color }) };
                        await set(KEY, userFlags);

                        sendBotMessage(ctx.channel.id, {
                            content: `Flag set on <@${userId}>: \`${text}\``
                        });
                        break;
                    }
                    case "remove": {
                        delete userFlags[userId];
                        await set(KEY, userFlags);

                        sendBotMessage(ctx.channel.id, {
                            content: `Flag removed from <@${userId}>`
                        });
                        break;
                    }
                }
            }
        }
    ]
});
