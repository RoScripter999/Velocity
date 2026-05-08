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

import { Tooltip } from "@webpack/common";
import type { ReactNode } from "react";

interface AddonBadgeProps {
    text: string;
    color?: string;
    icon?: ReactNode;
    onClick?: () => void;
    tooltip?: string;
}

export function AddonBadge({ text, color, icon, onClick, tooltip }: AddonBadgeProps) {
    const badge = (
        <div
            className="vc-addon-badge"
            onClick={onClick}
            style={{
                backgroundColor: color,
                alignItems: "center",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                display: "flex",
                marginLeft: "auto",
                padding: "0 6px",
                fontWeight: "bold",
                textTransform: "uppercase",
                cursor: onClick ? "pointer" : "default"
            }}
        >
            {icon && <span style={{ width: "14px", height: "14px", marginRight: "4px" }}>{icon}</span>}
            {text}
        </div>
    );

    if (!tooltip) return badge;

    return (
        <Tooltip text={tooltip}>
            {props => <div {...props}>{badge}</div>}
        </Tooltip>
    );
}
