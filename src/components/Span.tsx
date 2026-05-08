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

import type { TextProps, TextVariant } from "@velocity-types";
import { Text } from "@webpack/common";

export type SpanProps = TextProps<"span"> & {
    size?: string;
    weight?: string;
};

export function Span({ children, size = "sm", weight = "normal", ...restProps }: SpanProps) {
    const variant = `text-${size}/${weight}` as TextVariant;

    return (
        <Text tag="span" variant={variant} {...restProps}>
            {children}
        </Text>
    );
}
