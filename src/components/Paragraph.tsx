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

import type { HeadingTag, TextProps, TextVariant } from "@velocity-types";
import { Text } from "@webpack/common";

export type ParagraphProps = TextProps<HeadingTag> & {
    weight?: "normal" | "medium" | "semibold" | "bold";
    size?: "md" | "xs" | "sm" | "lg" | "xl";
};

/** @deprecated Use {@link Text} instead. */
export function Paragraph({ children, weight = "normal", size = "sm", ...restProps }: ParagraphProps) {
    const variant = `text-${size}/${weight}` as TextVariant;

    return (
        <Text scaleFontToUserSetting={true} tag="p" variant={variant} {...restProps}>
            {children}
        </Text>
    );
}
