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

import "./Card.css";

import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import type { ComponentProps, ComponentType, HTMLProps, PropsWithChildren } from "react";

const cl = classNameFactory("vc-card-");

export type CardProps = ComponentType<PropsWithChildren<HTMLProps<HTMLDivElement> & {
    /** Adds a 1px border around the card and border color depends on the {@link type}. @default true */
    outline?: boolean;
    /**
     * @default "sm"
     * @remarks Values — xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, none: undefined
     */
    padding?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "none";

    /** @default Card.Types.PRIMARY */
    type?: "brand" | "danger" | "primary" | "success" | "warning";
}>> & {
    Types: Record<"BRAND" | "DANGER" | "PRIMARY" | "SUCCESS" | "WARNING", string>;
};

export const Card = function ({ type = "primary", outline = true, padding = "sm", children, className, style, ...restProps }: ComponentProps<CardProps>) {
    return (
        <div
            className={classes(cl("primary", type, outline && "outline"), className)}
            style={padding !== "none" ? { padding: `var(--size-${padding})`, ...style } : style}
            {...restProps}
        >
            {children}
        </div>
    );
};

Card.Types = Object.freeze({
    BRAND: "brand",
    DANGER: "danger",
    PRIMARY: "primary",
    SUCCESS: "success",
    WARNING: "warning"
});
