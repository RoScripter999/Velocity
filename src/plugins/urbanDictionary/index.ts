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

import { ApplicationCommandOptionType, sendBotMessage } from "@api/Commands";
import { ApplicationCommandInputType } from "@api/Commands/types";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { PluginNative } from "@utils/types";
import { ButtonStyle, ComponentType, SeparatorSpacingSize } from "@velocity-types/enums";

const Native = VelocityNative.pluginHelpers.UrbanDictionary as PluginNative<typeof import("./native")>;

export default definePlugin({
    name: "UrbanDictionary",
    description: "Searches for a word on Urban Dictionary",
    tags: ["Fun", "Commands", "Media"],
    authors: [Devs.RoScripter999],
    dependencies: ["CommandsAPI"],

    commands: [
        {
            name: "urban",
            description: "Returns the definition of a word from Urban Dictionary",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    type: ApplicationCommandOptionType.STRING,
                    name: "word",
                    description: "The word to search for on Urban Dictionary",
                    required: true
                }
            ],
            execute: async (args, ctx) => {
                try {
                    const { status, data } = await Native.makeDictionaryReq(args[0].value);

                    if (status !== 200 || !data.list?.[0])
                        return void sendBotMessage(ctx.channel.id, { content: "No results found ):" });

                    const definition = data.list.reduce((longest, current) =>
                        current.definition.length > longest.definition.length ? current : longest
                    );

                    const msg = {
                        type: ComponentType.Container,
                        components: [
                            { type: ComponentType.TextDisplay, content: `## Definition of ${definition.word}` },
                            { type: ComponentType.TextDisplay, content: `${definition.definition.replace(/\[(.+?)\]/g, (_, word) => `[${word}](https://www.urbandictionary.com/define.php?term=${encodeURIComponent(word)})`)} \n### Example:\n${definition.example}` }, {
                                type: ComponentType.Separator, divider: true, spacing: SeparatorSpacingSize.Small
                            },
                            { type: ComponentType.TextDisplay, content: `-# *Definition details*: \n\n *👍 ${definition.thumbs_up.toString()} | 👎 ${definition.thumbs_down.toString()}* | Uploaded by **${definition.author}**\n` }, {
                                type: ComponentType.ActionRow,
                                components: [
                                    { type: ComponentType.Button, style: ButtonStyle.LINK, label: "UrbanDictionary Post", url: definition.permalink }
                                ]
                            }
                        ]
                    };
                    return void sendBotMessage(ctx.channel.id, { components: [msg] });
                } catch (error) {
                    new Logger("UrbanDictionary").error(`Failed to get this word.. ${error}`);
                }
            }
        }
    ]
});
