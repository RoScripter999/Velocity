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

import { classes } from "@utils/misc";
import type { CodeLanguage } from "@velocity-types";
import { findCssClassesLazy } from "@webpack";
import { Parser } from "@webpack/common";
import type { ReactNode } from "react";

const CodeContainerClasses = findCssClassesLazy("markup", "codeContainer");

/**
 * Renders code in a Discord codeblock
 */
export function CodeBlock({ className, ...props }: { content?: string, lang?: CodeLanguage; className?: string; }) {
    return (
        <div className={classes(CodeContainerClasses.markup, className)}>
            {Parser.defaultRules.codeBlock.react(props, null, {})}
        </div>
    );
}

/**
 * Renders inline code like `this`
 */
export function InlineCode({ children, className }: { children: ReactNode; className?: string; }) {
    return (
        <span className={classes(CodeContainerClasses.markup, className)}>
            <code className="inline">{children}</code>
        </span>
    );
}
