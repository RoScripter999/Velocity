/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 Velocitcs and contributors
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

import "./FormInfo.css";

import { Forms, React, Text } from "@webpack/common";
import type { ComponentType, JSX, ReactNode } from "react";

interface RowProps {
    label: string;
    icon?: ComponentType;
}

interface GroupProps {
    children: ReactNode;
}

export const FormInfo = {
    Group: Group,
    Row: Row
};

function Group({ children }: GroupProps): JSX.Element {
    const items = React.Children.toArray(children).reduce<ReactNode[]>((acc, child, index, arr) => {
        if (!React.isValidElement(child)) return acc;

        acc.push(child);

        if (
            index < arr.length - 1 &&
            React.isValidElement(arr[index + 1]) &&
            (child.type === Row || child.type === Row)
        ) {
            acc.push(<Forms.FormDivider key={`divider-${index}`} />);
        }

        return acc;
    }, []);

    return <div className="vc-forminfo-group">{items}</div>;
}

function Row({ label, icon: Icon, ...rest }: RowProps) {
    return (
        <div className="vc-forminfo-row" {...rest}>
            {Icon && <Icon />}
            {<Text variant="text-md/medium">{label}</Text>}
        </div>
    );
}
