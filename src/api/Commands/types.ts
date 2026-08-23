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

import type { Command, CommandContext, CommandReturnValue, Message } from "@velocity-types";
import type { PartialDeep, Promisable } from "type-fest";

export { ApplicationCommandInputType, ApplicationCommandOptionType, ApplicationCommandType } from "@velocity-types/enums";

export interface CommandInteractionOptions {
    getString(name: string, required: true): string;
    getString(name: string, required?: boolean): string | null;
    getInteger(name: string, required: true): number;
    getInteger(name: string, required?: boolean): number | null;
    getNumber(name: string, required: true): number;
    getNumber(name: string, required?: boolean): number | null;
    getBoolean(name: string, required: true): boolean;
    getBoolean(name: string, required?: boolean): boolean | null;
    getMember(name: string): number | null;
    getRole(name: string, required: true): number;
    getRole(name: string, required?: boolean): number | null;
    getAttachment(name: string, required: true): number;
    getAttachment(name: string, required?: boolean): number | null;
}

export interface CommandInteraction {
    options: CommandInteractionOptions;
    getSubcommand(): string;
    reply(data: PartialDeep<Message>): void;
}

export interface VelocityCommand extends Omit<Command, "execute"> {
    isVelocityCommand?: boolean;
    rootCommand?: VelocityCommand;
    execute(interaction: CommandInteraction, ctx: CommandContext): Promisable<void | CommandReturnValue>;
}
