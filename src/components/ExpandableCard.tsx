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

import "./ExpandableCard.css";

import type { IconProps } from "@velocity-types";
import { Clickable, Icons, useState } from "@webpack/common";
import type { ComponentType, PropsWithChildren, ReactNode } from "react";

import { Card } from "./Card";

type ButtonProps = {
    onClick: () => void;
    icon: ComponentType<IconProps>;
    size?: IconProps["size"];
};

type ExpandableCard = PropsWithChildren<{
    render: () => ReactNode;
    buttons?: ButtonProps[];
    initialExpanded?: boolean;
}>;

export function ExpandableCard({ children, render: Content, buttons = [], initialExpanded = false }: ExpandableCard) {
    const [expanded, setExpanded] = useState(initialExpanded);

    const Icon = expanded ? Icons.ChevronSmallDownIcon : Icons.ChevronSmallRightIcon;

    return (
        <Card data-expanded={expanded} padding="none" className="vc-expandable-card">
            <Clickable className="vc-expandable-card-header" onClick={e => { e.preventDefault(); setExpanded(c => !c); }}>
                {children}
                <div className="vc-expandable-card-icons">
                    <Icon />
                    {buttons && buttons.map(({ icon: IconComponent, onClick, size }, idx) => (
                        <Clickable key={idx} onClick={onClick}>
                            <IconComponent size={size ?? "sm"} />
                        </Clickable>
                    ))}
                </div>
            </Clickable>

            {
                expanded
                    ? <div className="vc-expandable-card-content">
                        <Content />
                    </div>
                    : null
            }
        </Card >
    );
}
