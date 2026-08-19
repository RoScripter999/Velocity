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

import { get, set } from "@api/DataStore";
import { CodeBlock } from "@components/CodeBlock";
import { Margins } from "@components/margins";
import { SettingsTab } from "@components/settings";
import { copyToClipboard } from "@utils/misc";
import { Buttons, Field, Forms, Icons, Select, Text, TextInput, useEffect, useState } from "@webpack/common";

import { type SearchMethod, searchMethods, type SearchResult } from "./utils";


type SearchFilters = {
    queries: string[];
    type: SearchMethod;
};

const defaultFilters: SearchFilters = {
    queries: [""],
    type: "findByCode"
};

interface FindResult {
    error?: string;
    matches?: SearchResult[];
}

function performSearch(queries: string[], method: SearchMethod): FindResult {
    const clean = queries.map(q => q.trim()).filter(Boolean);
    if (!clean.length) return {};

    const matches = searchMethods[method](clean);

    if (!matches.length)
        return { error: method === "findByModuleId" ? "Module ID not found" : "No modules found" };
    if (matches.length > 1)
        return { matches, error: `Found ${matches.length} modules` };

    return { matches };
}

function SearchHelper() {
    const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
    const [result, setResult] = useState<FindResult>({});

    useEffect(() => {
        get("SearchHelper").then(saved => {
            if (!saved?.filters) return;
            setFilters(saved.filters);
            setResult(performSearch(saved.filters.queries, saved.filters.type));
        });
    }, []);

    useEffect(() => {
        set("SearchHelper", { filters });
    }, [filters]);

    const update = (next: SearchFilters) => {
        setFilters(next);
        setResult(performSearch(next.queries, next.type));
    };

    const updateQuery = (index: number, value: string | null) => {
        const queries = value === null
            ? filters.queries.filter((_, i) => i !== index)
            : filters.queries.map((q, i) => i === index ? value : q);
        update({ ...filters, queries: queries.length ? queries : [""] });
    };

    const singleMatch = result.matches?.length === 1 ? result.matches[0] : null;

    return (
        <SettingsTab>
            <section>
                <Select
                    label="Search Method"
                    description="Search method of the module"
                    options={Object.keys(searchMethods).map(key => ({ label: key, value: key }))}
                    value={filters.type}
                    onSelectionChange={val => update({ queries: [""], type: val })}
                    formatOption={option => ({ ...option, id: option.value })}
                />
            </section>

            <Forms.FormDivider gap={20} />

            <section>
                <Field label="Search Params">
                    {({ controlId }) => {
                        switch (filters.type) {
                            case "findByCode":
                            case "findByProps":
                            case "findComponentByCode":
                                return filters.queries.map((query, index) => (
                                    <TextInput
                                        type="text"
                                        key={index}
                                        id={index === filters.queries.length - 1 ? controlId : undefined}
                                        autoFocus
                                        value={query}
                                        onChange={v => updateQuery(index, v)}
                                        placeholder="Param"
                                        trailing={index > 0 ? { type: "icon", tooltip: "Remove", icon: () => <Icons.TrashIcon color="var(--icon-feedback-critical)" size="sm" />, onClick: () => updateQuery(index, null) } : undefined}
                                    />
                                ));
                            case "findByModuleId":
                                return (
                                    <TextInput
                                        type="number"
                                        id={controlId}
                                        autoFocus
                                        value={filters.queries[0]}
                                        onChange={v => updateQuery(0, v)}
                                        placeholder="Param"
                                    />
                                );
                            default:
                                return <Text>No type found</Text>;
                        }
                    }}
                </Field>

                <Buttons.ButtonGroup direction="horizontal" className={Margins.top8}>
                    <Buttons.Button
                        onClick={() => update({ ...filters, queries: [...filters.queries, ""] })}
                        variant="secondary"
                        size="sm"
                        text="Add Filter"
                        disabled={filters.type === "findByModuleId" || !filters.queries[filters.queries.length - 1].length}
                    />
                    {result.matches && result.matches.length > 0 && (
                        <Buttons.Button
                            variant="active"
                            size="sm"
                            onClick={() => console.log(result.matches?.map(m => m.factory))}
                            text={singleMatch ? "Print" : "Log All"}
                        />
                    )}
                </Buttons.ButtonGroup>

                {(!!result.error || !!singleMatch) && (
                    <div className={Margins.top16} style={{ color: result.error ? "var(--text-feedback-critical)" : "var(--text-feedback-info)" }}>
                        {(() => {
                            const Icon = result.error ? Icons.CircleErrorIcon : Icons.TopicsIcon;
                            return <Icon size="sm" color="currentColor" style={{ verticalAlign: "middle", marginRight: 6 }} />;
                        })()}
                        <Text color="currentColor" style={{ display: "inline" }}>
                            {result.error || "Find: OK"}
                        </Text>
                    </div>
                )}
            </section>

            {singleMatch && <Forms.FormDivider gap={8} />}

            {singleMatch && (
                <section>
                    <Text tag="h2">Quick Actions</Text>
                    <Buttons.ButtonGroup direction="horizontal" className={Margins.top8}>
                        <Buttons.Button
                            text="Copy Module Code"
                            size="sm"
                            variant="secondary"
                            onClick={() => copyToClipboard(singleMatch.factory.toString())}
                        />
                        <Buttons.Button
                            text="Copy Module ID"
                            size="sm"
                            variant="secondary"
                            onClick={() => copyToClipboard(singleMatch.id.toString())}
                        />
                    </Buttons.ButtonGroup>
                    <Text className={Margins.top8} tag="h2">Module</Text>

                    <CodeBlock lang="js" content={String(singleMatch.factory)} />
                </section>
            )}
        </SettingsTab>
    );
}

export default (!IS_STANDALONE ? SearchHelper : null) as any;
