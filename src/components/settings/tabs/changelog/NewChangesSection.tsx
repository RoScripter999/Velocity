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

import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings";
import { PluginCard } from "@components/settings/tabs/plugins/PluginCard";
import { wordsToTitle } from "@utils/text";
import { findByPropsLazy } from "@webpack";
import { Icons, Text } from "@webpack/common";

import Plugins from "~plugins";

import { cl } from ".";
import type { ChangelogEntry } from "./changelogManager";

const ChangeLogClasses = findByPropsLazy("image", "improved");

interface PluginChangesProps {
    added?: string[];
    modified?: string[];
}

interface NewChangesSectionProps {
    commits: ChangelogEntry[];
    newPlugins: string[];
    updatedPlugins: string[];
}

const CATEGORIES = [
    { key: "added", label: "Added", pattern: /^(feat|feature|add|new)(\(.+?\))?:\s*/i },
    { key: "fixed", label: "Fixed", pattern: /^fix(\(.+?\))?:\s*/i },
    { key: "improved", label: "Improved", pattern: /^(perf|improve|refactor|update|enhance|chore)(\(.+?\))?:\s*/i }
] as const;

function PluginChanges({ added = [], modified = [] }: PluginChangesProps) {
    const sections = [
        { id: "added", label: "Added", Icon: Icons.PlusSmallIcon, names: added },
        { id: "modified", label: "Modified", Icon: Icons.PencilIcon, names: modified }
    ].filter(s => s.names.length > 0);
    if (!sections.length) return null;

    return (
        <Flex flexDirection="column" gap="0.625em">
            {sections.map(({ id, label, Icon, names }) => {
                const pluginNames = names.filter(n => Plugins[n] && !Plugins[n].hidden);
                if (!pluginNames.length) return null;

                return (
                    <Flex flexDirection="column" gap="0.3em" key={id}>
                        <Flex alignItems="center" gap="0.2em" className={cl(id)}>
                            <Icon size="xs" color="currentColor" />
                            <Text variant="text-xs/semibold" className={cl(id)}>
                                {label} ({pluginNames.length})
                            </Text>
                        </Flex>
                        <div className={cl("plugins-grid")}>
                            {pluginNames.map(name => (
                                <PluginCard
                                    key={name}
                                    plugin={Plugins[name]}
                                    disabled={false}
                                    onRestartNeeded={() => { }}
                                    isNew={id === "added"}
                                />
                            ))}
                        </div>
                    </Flex>
                );
            })}
        </Flex>
    );
}

function parseMessage(message: string): { key: string; text: string; } {
    for (const cat of CATEGORIES) {
        const match = message.match(cat.pattern);
        if (match) return { key: cat.key, text: wordsToTitle([message.slice(match[0].length).trim() || message]) };
    }
    return { key: "other", text: wordsToTitle([message]) };
}

function ParsedChangelog({ commits }: { commits: ChangelogEntry[]; }) {
    const grouped: Record<string, string[]> = { added: [], fixed: [], improved: [], other: [] };
    for (const { message } of commits) {
        const { key, text } = parseMessage(message);
        grouped[key].push(text);
    }

    const visibleCats = CATEGORIES.filter(c => grouped[c.key].length > 0);
    const hasOther = grouped.other.length > 0;

    if (!visibleCats.length && !hasOther) return null;

    return (
        <div className={cl("parsed")}>
            {visibleCats.map(({ key, label }) => (
                <div key={key}>
                    <h2 className={ChangeLogClasses[key]}><strong>{label}</strong></h2>
                    <ul className={ChangeLogClasses.list}>
                        {grouped[key].map((text, i) => <li key={i}>{text}</li>)}
                    </ul>
                </div>
            ))}
            {hasOther && (
                <div>
                    <h2 className={ChangeLogClasses.improved}><strong>Changes</strong></h2>
                    <ul className={ChangeLogClasses.list}>
                        {grouped.other.map((text, i) => <li key={i}>{text}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function NewChangesSection({ commits, newPlugins, updatedPlugins }: NewChangesSectionProps) {
    const hasPlugins = newPlugins.length > 0 || updatedPlugins.length > 0;
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
                    <PluginChanges added={newPlugins} modified={updatedPlugins} />
                </div>
            )}
            {hasCommits && <ParsedChangelog commits={commits} />}
        </>
    );
}
