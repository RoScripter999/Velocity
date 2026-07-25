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

import { Logger } from "@utils/Logger";
import { makeCodeblock } from "@utils/text";
import type { Command, CommandArgument, CommandContext, CommandOption } from "@velocity-types";

import { sendBotMessage } from "./commandHelpers";
import { ApplicationCommandInputType, ApplicationCommandOptionType, ApplicationCommandType, type CommandInteraction, type VelocityCommand } from "./types";

export * from "./commandHelpers";
export * from "./types";

export let BUILT_IN: VelocityCommand[];
export const commands = {} as Record<string, VelocityCommand>;

// hack for plugins being evaluated before we can grab these from webpack
const OptPlaceholder = Symbol("OptionalMessageOption") as any as CommandOption;
const ReqPlaceholder = Symbol("RequiredMessageOption") as any as CommandOption;

/**
 * Optional message option named "message" you can use in commands.
 * Used in "tableflip" or "shrug"
 * @see {@link RequiredMessageOption}
 */
export let OptionalMessageOption: CommandOption = OptPlaceholder;
/**
 * Required message option named "message" you can use in commands.
 * Used in "me"
 * @see {@link OptionalMessageOption}
 */
export let RequiredMessageOption: CommandOption = ReqPlaceholder;

let idCounter = 99;

export const _init = function (cmds: VelocityCommand[]) {
    try {
        BUILT_IN = cmds;
        OptionalMessageOption = cmds.find(c => (c.untranslatedName || c.displayName) === "shrug")!.options![0];
        RequiredMessageOption = cmds.find(c => (c.untranslatedName || c.displayName) === "me")!.options![0];
        idCounter = Math.abs(BUILT_IN.map(x => Number(x.id)).sort((x, y) => x - y)[0]) + 1;
    } catch (e) {
        new Logger("CommandsAPI").error("Failed to load CommandsApi", e, " - cmds is", cmds);
    }
    return cmds;
} as never;

export const _handleCommand = function (cmd: VelocityCommand, args: CommandArgument[], ctx: CommandContext) {
    if (!cmd.isVelocityCommand)
        return (cmd as unknown as Command).execute(args, ctx);

    const handleError = (err: any) => {
        // TODO: cancel send if cmd.inputType === BUILT_IN_TEXT
        const msg = `An Error occurred while executing command "${cmd.name}"`;
        const reason = err instanceof Error ? err.stack || err.message : String(err);

        console.error(msg, err);
        sendBotMessage(ctx.channel.id, {
            content: `${msg}:\n${makeCodeblock(reason)}`,
            author: {
                username: "Velocity"
            }
        });
    };

    // For subcommands, options are nested inside args[0].options so yea...
    const effectiveArgs = args[0]?.options ?? args;

    const getString = ((name, required) => {
        const arg = effectiveArgs.find(a => a.name === name);
        if (arg == null) {
            if (required) throw new Error(`Required option "${name}" not provided`);
            return null;
        }
        return String(arg.value) as any;
    });

    const getNumber = ((name, required) => {
        const arg = effectiveArgs.find(a => a.name === name);
        if (arg == null) {
            if (required) throw new Error(`Required option "${name}" not provided`);
            return null;
        }
        return Number(arg.value) as any;
    });

    const getBoolean = ((name, required) => {
        const arg = effectiveArgs.find(a => a.name === name);
        if (arg == null) {
            if (required) throw new Error(`Required option "${name}" not provided`);
            return null;
        }
        return arg.value as any;
    });

    const getInteger = ((name, required) => {
        const arg = effectiveArgs.find(a => a.name === name);
        if (arg == null) {
            if (required) throw new Error(`Required option "${name}" not provided`);
            return null;
        }
        return parseInt(String(arg.value), 10) as any;
    });

    const getMember = (name => {
        const arg = effectiveArgs.find(a => a.name === name);
        if (arg == null) return null;
        return arg.value as any;
    });

    const getAttachment = ((name, required) => {
        const arg = effectiveArgs.find(a => a.name === name);
        if (arg == null) {
            if (required) throw new Error(`Required option "${name}" not provided`);
            return null;
        }
        return arg.value as any;
    });

    const getRole = ((name, required) => {
        const arg = effectiveArgs.find(a => a.name === name);
        if (arg == null) {
            if (required) throw new Error(`Required option "${name}" not provided`);
            return null;
        }
        return arg.value as any;
    });

    const getSubcommand = (() => {
        const arg = args[0]?.name;
        return arg as any;
    });

    const interaction: CommandInteraction = {
        options: { getString, getNumber, getBoolean, getInteger, getMember, getRole, getAttachment },
        getSubcommand,
        reply(data) {
            sendBotMessage(ctx.channel.id, data);
        }
    };

    try {
        const res = cmd.execute(interaction, ctx);
        return res instanceof Promise ? res.catch(handleError) : res;
    } catch (err) {
        return handleError(err);
    }
} as never;


/**
 * Prepare a Command Option for Discord by filling missing fields
 * @param opt
 */
export function prepareOption<O extends CommandOption | VelocityCommand>(opt: O): O {
    opt.displayName ||= opt.name;
    opt.displayDescription ||= opt.description;
    opt.options?.forEach((opt, i, opts) => {
        // See comment above Placeholders
        if (opt === OptPlaceholder) opts[i] = OptionalMessageOption;
        else if (opt === ReqPlaceholder) opts[i] = RequiredMessageOption;
        opt.choices?.forEach(x => x.displayName ||= x.name);

        prepareOption(opts[i]);
    });
    return opt;
}

const isSubCommandParent = (cmd: VelocityCommand) => cmd.options?.[0]?.type === ApplicationCommandOptionType.SUB_COMMAND;
const getSubCommandName = (cmd: VelocityCommand, option: CommandOption) => `${cmd.name} ${option.name}`;

// Yes, Discord registers individual commands for each subcommand
function registerSubCommands(cmd: VelocityCommand, plugin: string) {
    cmd.options?.forEach(o => {
        if (o.type !== ApplicationCommandOptionType.SUB_COMMAND)
            throw new Error("When specifying sub-command options, all options must be sub-commands.");
        const subCmd = {
            ...cmd,
            ...o,
            options: o.options !== undefined ? o.options : undefined,
            type: ApplicationCommandType.CHAT_INPUT,
            name: getSubCommandName(cmd, o),
            id: `${o.name}-${cmd.id}`,
            displayName: getSubCommandName(cmd, o),
            subCommandPath: [{
                name: o.name,
                type: o.type,
                displayName: o.name
            }],
            rootCommand: cmd
        };
        registerCommand(subCmd, plugin);
    });
}

export function registerCommand<C extends VelocityCommand>(command: C, plugin: string) {
    if (!BUILT_IN) {
        new Logger("CommandsAPI").warn(
            `Not registering ${command.name} as the API hasn't been initialised.`,
            "Please restart to use commands"
        );
        return;
    }

    if (BUILT_IN.some(c => c.name === command.name))
        throw new Error(`Command '${command.name}' already exists.`);

    command.isVelocityCommand = true;
    command.untranslatedName ??= command.name;
    command.untranslatedDescription ??= command.description;
    command.id ??= `-${idCounter++}`;
    command.applicationId ??= "-1"; // BUILT_IN;
    command.type ??= ApplicationCommandType.CHAT_INPUT;
    command.inputType ??= ApplicationCommandInputType.BUILT_IN_TEXT;
    command.plugin ||= plugin;

    prepareOption(command);
    commands[command.name] = command;

    if (isSubCommandParent(command)) {
        registerSubCommands(command, plugin);
        return;
    }

    commands[command.name] = command;
    BUILT_IN.push(command);
}

export function unregisterCommand(name: string) {
    const idx = BUILT_IN.findIndex(c => c.name === name);
    if (idx === -1)
        return false;

    BUILT_IN.splice(idx, 1);
    delete commands[name];

    return true;
}
