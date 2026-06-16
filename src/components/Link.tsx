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

import "./Link.css";

import { classes } from "@utils/misc";
import type { AnchorHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from "react";

export interface LinkProps extends DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
    disabled?: boolean;
    useDefaultUnderlineStyles?: boolean;
}

export function Link({
    disabled,
    useDefaultUnderlineStyles = true,
    href,
    rel,
    target,
    className,
    children,
    ...restProps
}: PropsWithChildren<LinkProps>) {

    const isInternal = href && /^(?:discord:\/)?\/[a-zA-Z0-9_-]/.test(href);
    const needsSafeAttrs = href && !isInternal;

    return (
        <a
            role="link"
            href={href}
            target={target ?? (needsSafeAttrs ? "_blank" : undefined)}
            rel={rel ?? (needsSafeAttrs ? "noreferrer noopener" : undefined)}
            className={classes(
                "vc-link",
                useDefaultUnderlineStyles && "vc-link-underline-on-hover",
                disabled && "vc-link-disabled",
                className
            )}
            aria-disabled={disabled}
            {...restProps}
        >
            {children}
        </a>
    );
}
