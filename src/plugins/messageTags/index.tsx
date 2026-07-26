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

import { ApplicationCommandInputType, ApplicationCommandOptionType, registerCommand, sendBotMessage, unregisterCommand } from "@api/Commands";
import { migratePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import definePlugin from "@utils/types";
import { FluxDispatcher, MessageActions, PendingReplyStore } from "@webpack/common";

import { openManageTagModal } from "./CreateTagModal";
import { getTag, getTags, removeTag, settings, type Tag } from "./settings";

const CustomCommandsMarker = Symbol("CustomCommands");
const ArgumentRegex = /{{(.+?)}}/g;

export function parseTagArguments(message: string) {
    const args = [] as { name: string, defaultValue: string | null; type: ApplicationCommandOptionType | "unknown"; }[];

    for (const [, value] of message.matchAll(ArgumentRegex)) {
        const parts = value.split(",").map(s => s.trim());
        const [name, defaultValue] = parts[0].split("=").map(s => s.trim());

        if (!name) continue;
        if (args.some(arg => arg.name === name)) continue;

        let type: ApplicationCommandOptionType | "unknown" = ApplicationCommandOptionType.STRING;
        for (const part of parts.slice(1)) {
            if (part.startsWith("type")) {
                const typeValue = part.split("=").map(s => s.trim())[1]?.toLowerCase();
                const resolvedType = getOptionTypeFromString(typeValue);
                type = resolvedType ?? "unknown";
                break;
            }
        }

        args.push({ name: name.toLowerCase(), defaultValue: defaultValue ?? null, type });
    }

    return args;
}

export function validateTagArguments(message: string): string[] {
    const errors: string[] = [];
    const seenNames = new Set<string>();
    const validTypes = new Set(["string", "integer", "number", "boolean", "user", "role"]);

    for (const [, value] of message.matchAll(ArgumentRegex)) {
        const parts = value.split(",").map(s => s.trim());
        const [name] = parts[0].split("=").map(s => s.trim());

        if (!name) {
            errors.push("Argument has no name.");
            continue;
        }

        const nameLower = name.toLowerCase();
        if (nameLower === "ephemeral") {
            errors.push('Argument name "ephemeral" is reserved.');
            continue;
        }

        if (seenNames.has(nameLower)) {
            errors.push(`Duplicate argument name: "${name}".`);
            continue;
        }
        seenNames.add(nameLower);

        for (const part of parts.slice(1)) {
            if (part.startsWith("type")) {
                const typeValue = part.split("=").map(s => s.trim())[1]?.toLowerCase();
                if (!typeValue) {
                    errors.push(`Type value missing for argument "${name}".`);
                } else if (!validTypes.has(typeValue)) {
                    errors.push(`Invalid type "${typeValue}" for argument "${name}".`);
                }
            }
        }
    }

    return errors;
}

function getOptionTypeFromString(typeStr?: string): ApplicationCommandOptionType | null {
    const typeMap: Record<string, ApplicationCommandOptionType> = {
        "string": ApplicationCommandOptionType.STRING,
        "integer": ApplicationCommandOptionType.INTEGER,
        "boolean": ApplicationCommandOptionType.BOOLEAN,
        "user": ApplicationCommandOptionType.USER,
        "role": ApplicationCommandOptionType.ROLE,
        "number": ApplicationCommandOptionType.NUMBER
    };
    return typeMap[typeStr ?? ""] ?? null;
}

export function registerTagCommand(tag: Tag) {
    const tagArguments = parseTagArguments(tag.message);

    registerCommand({
        name: tag.name,
        description: tag.name,
        inputType: ApplicationCommandInputType.BUILT_IN,
        options: [
            ...tagArguments.filter(arg => arg.type !== "unknown").map(arg => ({
                name: arg.name,
                description: arg.name,
                type: arg.type as ApplicationCommandOptionType,
                required: arg.defaultValue === null
            })),
            {
                name: "ephemeral",
                description: "Whether the response should only be visible to you",
                type: ApplicationCommandOptionType.BOOLEAN,
                required: false
            }
        ],

        execute: async (interaction, ctx) => {
            const ephemeral = interaction.options.getBoolean("ephemeral", false);

            const response = tag.message
                .replace(ArgumentRegex, (fullMatch, value: string) => {
                    const parts = value.split(",").map(s => s.trim());
                    const [argName] = parts[0].split("=").map(s => s.trim());

                    const argDef = tagArguments.find(arg => arg.name === argName.toLowerCase());
                    if (!argDef) return fullMatch;

                    let result: string | null = null;
                    if (argDef.type === "unknown") {
                        result = null;
                    } else if (argDef.type === ApplicationCommandOptionType.STRING) {
                        result = interaction.options.getString(argName.toLowerCase());
                    } else if (argDef.type === ApplicationCommandOptionType.INTEGER) {
                        result = interaction.options.getInteger(argName.toLowerCase())?.toString() ?? null;
                    } else if (argDef.type === ApplicationCommandOptionType.NUMBER) {
                        result = interaction.options.getNumber(argName.toLowerCase())?.toString() ?? null;
                    } else if (argDef.type === ApplicationCommandOptionType.BOOLEAN) {
                        result = interaction.options.getBoolean(argName.toLowerCase())?.toString() ?? null;
                    } else if (argDef.type === ApplicationCommandOptionType.USER) {
                        const member = interaction.options.getMember(argName.toLowerCase());
                        result = member ? `<@${member}>` : null;
                    } else if (argDef.type === ApplicationCommandOptionType.ROLE) {
                        const role = interaction.options.getRole(argName.toLowerCase());
                        result = role ? `<@&${role}>` : null;
                    } else {
                        result = interaction.options.getString(argName.toLowerCase());
                    }

                    const [, defaultValue] = parts[0].split("=").map(s => s.trim());
                    return result ?? defaultValue ?? fullMatch;
                })
                .replaceAll("\\n", "\n");

            const doSend = ephemeral ? sendBotMessage : sendMessage;
            doSend(ctx.channel.id, { content: response }, false, MessageActions.getSendMessageOptionsForReply(PendingReplyStore.getPendingReply(ctx.channel.id)));
            FluxDispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId: ctx.channel.id });
        },
        [CustomCommandsMarker]: true
    }, "CustomCommands");
}

migratePluginSettings("CustomCommands", "MessageTags");
export default definePlugin({
    name: "CustomCommands",
    description: "Allows you to create custom slash commands / tags",
    dependencies: ["CommandsAPI"],
    searchTerms: ["MessageTags"],
    authors: [Devs.Ven, Devs.Luna],
    tags: ["Commands", "Customisation", "Utility"],
    settings,

    start() {
        getTags().forEach(registerTagCommand);
    },

    stop() {
        getTags().forEach(tag => unregisterCommand(tag.name));
    },


    commands: [
        {
            name: "tags",
            description: "Manage all custom commands",
            inputType: ApplicationCommandInputType.BUILT_IN,
            options: [
                {
                    name: "manage",
                    description: "Manage your tags",
                    type: ApplicationCommandOptionType.SUB_COMMAND
                },
                {
                    name: "delete",
                    description: "Remove a tag by name",
                    type: ApplicationCommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: "tag-name",
                            description: "The name of the tag",
                            type: ApplicationCommandOptionType.STRING,
                            required: true
                        }
                    ]
                }
            ],

            async execute(interaction) {
                switch (interaction.getSubcommand()) {
                    case "manage": {
                        openManageTagModal();
                        break;
                    }

                    case "delete": {
                        const name = interaction.options.getString("tag-name", true) ?? "";

                        if (!getTag(name))
                            return void interaction.reply({
                                content: `A Tag with the name **${name}** does not exist!`
                            });

                        removeTag(name);

                        interaction.reply({
                            content: `Successfully deleted the tag **${name}**!`
                        });

                        break;
                    }
                }
            }
        }
    ]
});
