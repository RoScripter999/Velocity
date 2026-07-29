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

import type { ChangelogEntry } from "@api/Changelog";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings";
import { PluginCard } from "@components/settings/tabs/plugins/PluginCard";
import { wordsToTitle } from "@utils/text";
import { Icons, showToast, Text } from "@webpack/common";

import Plugins from "~plugins";

import { cl, NewChangesSectionProps } from ".";

interface PluginChangesProps {
    added: string[];
    removed: string[];
    fixed: string[];
    improved: string[];
}

const CATEGORIES = [
    { key: "added", label: "Added", pattern: /^([\[\w\]-]+:\s*|\[[^\]]+\]\s*)?(feat|feature|add(ed)?|new)(\(.+?\))?(:|\s+)/i, icon: () => Icons.PlusSmallIcon },
    { key: "removed", label: "Removed", pattern: /^([\[\w\]-]+:\s*|\[[^\]]+\]\s*)?(remove(d)?|delete(d)?)(\(.+?\))?(:|\s+)/i, icon: () => Icons.DenyIcon },
    { key: "fixed", label: "Fixed", pattern: /^([\[\w\]-]+:\s*|\[[^\]]+\]\s*)?(fix(e[sd])?)(\(.+?\))?(:|\s+)/i, icon: () => Icons.AIcon },
    { key: "improved", label: "Improved", pattern: /^([\[\w\]-]+:\s*|\[[^\]]+\]\s*)?(improve(d)?|refactor|update(d)?)(\(.+?\))?(:|\s+)/i, icon: () => Icons.PencilIcon }
] as const;

function PluginChanges({ added, removed, fixed, improved }: PluginChangesProps) {
    const pluginMap = { added, removed, fixed, improved };

    const sections = CATEGORIES
        .filter(cat => cat.icon)
        .map(cat => ({
            id: cat.key,
            label: cat.label,
            Icon: cat.icon,
            names: pluginMap[cat.key as keyof typeof pluginMap]
        }))
        .filter(s => s.names.length > 0);

    if (!sections.length) return null;

    return (
        <Flex flexDirection="column" gap="0.625em">
            {sections.map(({ id, label, Icon, names }) => {
                const pluginNames = names.filter(n => id === "removed" || !Plugins[n]?.hidden);
                if (!pluginNames.length) return null;

                const IconComponent = Icon();
                return (
                    <Flex flexDirection="column" gap="0.3em" key={id}>
                        <div className={cl("plugins-title")}>
                            <IconComponent className={cl(id)} size="xs" color="currentColor" />
                            <Text variant="text-xs/semibold" className={cl(id)}>{label} ({pluginNames.length})</Text>
                        </div>
                        <div className={cl("plugins-grid")}>
                            {pluginNames.map(name => {
                                const plugin = Plugins[wordsToTitle([name])] ||
                                    { name: wordsToTitle([name]), description: "Description cannot be displayed since it's no longer in the client." };
                                return (
                                    <PluginCard
                                        key={name}
                                        plugin={plugin}
                                        disabled={id === "removed"}
                                        onRestartNeeded={() => showToast("Restart to apply changes!")}
                                        isNew={id === "added"}
                                    />
                                );
                            })}
                        </div>
                    </Flex>
                );
            })}
        </Flex>
    );
}

function RegularChanges({ commits }: { commits: ChangelogEntry[]; }) {
    const grouped: Record<string, string[]> = { other: [] };
    for (const { key } of CATEGORIES) {
        grouped[key] = [];
    }

    for (const { message } of commits) {
        let matched = false;
        for (const cat of CATEGORIES) {
            const match = message.match(cat.pattern);
            if (match) {
                const displayMessage = match[5] === ":" ? message.slice(match[0].length).trim() : message;
                grouped[cat.key].push(wordsToTitle([displayMessage]));
                matched = true;
                break;
            }
        }
        if (!matched) {
            grouped.other.push(wordsToTitle([message]));
        }
    }

    const activeCategories = [
        ...CATEGORIES.filter(c => grouped[c.key].length > 0),
        ...(grouped.other.length > 0 ? [{ key: "other", label: "Other Changes" }] : [])
    ];

    if (!activeCategories.length) return null;

    return activeCategories.map(({ key, label }) => (
        <section className={Margins.top20} key={key}>
            <Text tag="h2" variant="heading-md/bold" className={cl(key)}><span>{label}</span></Text>
            <ul className={cl("list")}>
                {grouped[key].map((text, i) => <li className={cl("list-item")} key={i}>{text}</li>)}
            </ul>
        </section>
    ));
}


export function NewChangesSection({ commits, newPlugins, updatedPlugins, removedPlugins, fixedPlugins }: NewChangesSectionProps) {
    const hasPlugins = newPlugins.length > 0 || updatedPlugins.length > 0 || removedPlugins.length > 0 || fixedPlugins.length > 0;
    const hasCommits = commits.length > 0;

    if (!hasPlugins && !hasCommits) return null;

    return (
        <>
            <SectionHeader
                tag="h3"
                title="Recent Changes"
                description="New commits and plugin updates since your last version."
                className={Margins.bottom16}
            />
            {hasPlugins && (
                <div className={Margins.bottom16}>
                    <Text variant="text-md/semibold" className={Margins.bottom8}>Plugin Changes</Text>
                    <PluginChanges
                        added={newPlugins}
                        improved={updatedPlugins}
                        removed={removedPlugins}
                        fixed={fixedPlugins}
                    />
                </div>
            )}
            {hasCommits && <RegularChanges commits={commits} />}
        </>
    );
}
