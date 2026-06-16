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

import { classNameFactory } from "@utils/css";
import { Icons, Text } from "@webpack/common";

import Plugins from "~plugins";

const cl = classNameFactory("vc-plugin-change-");

interface PluginChangesProps {
    added?: string[];
    modified?: string[];
    deleted?: string[];
}

const sections = [
    {
        key: "added",
        label: "Added",
        Icon: () => Icons.PlusSmallIcon,
        cls: "added"
    },
    {
        key: "modified",
        label: "Modified",
        Icon: () => Icons.PencilIcon,
        cls: "modified"
    },
    {
        key: "deleted",
        label: "Deleted",
        Icon: () => Icons.TrashIcon,
        cls: "deleted"
    }
] as const;

export function PluginChanges({ added = [], modified = [], deleted = [] }: PluginChangesProps) {
    const data: Record<string, string[]> = { added, modified, deleted };

    const visible = sections.filter(s => {
        const names = data[s.key];
        return names.length > 0;
    });

    if (!visible.length) return null;

    return (
        <div className={cl("root")}>
            {visible.map(({ key, label, Icon, cls }) => {
                const names = data[key].filter(n =>
                    key === "deleted" ? true : (Plugins[n] && !Plugins[n].hidden)
                );
                if (!names.length) return null;

                const IconComp = Icon();

                return (
                    <div key={key} className={cl("section")}>
                        <div className={cl("label", cls)}>
                            <IconComp size="xs" />
                            <Text variant="text-xs/semibold" className={cl(cls)}>
                                {label} ({names.length})
                            </Text>
                        </div>
                        <div className="vc-changelog-plugin-list">
                            {names.map(name => (
                                <span key={name} className={`vc-changelog-plugin-tag ${cl(cls + "-tag")}`}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
