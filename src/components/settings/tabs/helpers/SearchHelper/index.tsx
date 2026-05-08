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

import { get, set } from "@api/DataStore";
import { CodeBlock } from "@components/CodeBlock";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings/tabs/SectionHeader";
import { SettingsTab } from "@components/settings/tabs/SectionSettings";
import { copyWithToast } from "@utils/discord";
import { classes } from "@utils/misc";
import { Buttons, Forms, Icons, Select, Text, TextInput, Tooltip, useEffect, useMemo, useState } from "@webpack/common";

import { findByCode, findByComponentCode, findByModuleId, findByProps, logModules, type SearchResult } from "./utils";

enum SearchStatus {
    CODE,
    PROPS,
    COMPONENT_BY_CODE,
    MODULE_ID
}

interface FindResult {
    error?: string;
    matches?: SearchResult[];
}

const searchTypeHelpText: Record<SearchStatus, string> = {
    [SearchStatus.CODE]: "Find modules containing all snippets in their source code.",
    [SearchStatus.PROPS]: "Find modules that expose all provided property names.",
    [SearchStatus.COMPONENT_BY_CODE]: "Find React components by matching code fragments.",
    [SearchStatus.MODULE_ID]: "Resolve an exact webpack module id."
};

function performSearch(filters: string[], searchType: SearchStatus): FindResult {
    const cleanFilters = filters.map(q => q.trim()).filter(Boolean);
    if (!cleanFilters.length) return {};

    let matches: SearchResult[] = [];

    switch (searchType) {
        case SearchStatus.CODE:
            matches = findByCode(cleanFilters);
            break;
        case SearchStatus.PROPS:
            matches = findByProps(cleanFilters);
            break;
        case SearchStatus.COMPONENT_BY_CODE:
            matches = findByComponentCode(cleanFilters);
            break;
        case SearchStatus.MODULE_ID:
            const result = findByModuleId(cleanFilters[0]);
            if (result) matches = [result];
            break;
    }

    if (matches.length === 0) {
        return { error: searchType === SearchStatus.MODULE_ID ? "Module ID not found" : "No modules found" };
    }

    if (matches.length > 1) {
        return {
            matches,
            error: `Found ${matches.length} modules`
        };
    }

    return { matches };
}

function SearchHelper() {
    const [filters, setFilters] = useState<string[]>([""]);
    const [searchType, setSearchType] = useState<SearchStatus>(SearchStatus.CODE);
    const [result, setResult] = useState<FindResult>({});
    const normalizedFilters = useMemo(() => filters.map(f => f.trim()).filter(Boolean), [filters]);

    useEffect(() => {
        get("SearchHelper").then(saved => {
            if (saved?.filters) {
                setFilters(saved.filters);
                setSearchType(saved.searchType);
                setResult(performSearch(saved.filters, saved.searchType));
            }
        });
    }, []);

    useEffect(() => {
        set("SearchHelper", { filters, searchType });
    }, [filters, searchType]);

    const updateFilter = (index: number, value: string | null) => {
        const newFilters = value === null
            ? filters.filter((_, i) => i !== index).concat([])
            : filters.map((f, i) => i === index ? value : f);
        if (newFilters.length < 1) newFilters.push("");

        setFilters(newFilters);
        setResult(performSearch(newFilters, searchType));
    };

    const changeSearchType = (type: SearchStatus) => {
        setSearchType(type);
        setResult(performSearch(filters, type));
    };

    const reset = () => {
        const nextFilters = [""];
        setFilters(nextFilters);
        setSearchType(SearchStatus.CODE);
        setResult({});
    };

    const singleMatch = result.matches?.length === 1 ? result.matches[0] : null;
    const hasStatus = !!result.error || !!singleMatch;
    const hasResultSet = (result.matches?.length ?? 0) > 0;
    const canLog = hasResultSet && normalizedFilters.length > 0;

    return (
        <SettingsTab>
            <SectionHeader
                title="Search by"
                tooltip={searchTypeHelpText[searchType]}
                description="Choose a lookup strategy, then add one or more filters."
            />
            <Select
                options={[
                    { label: "findByCode", value: SearchStatus.CODE, default: true },
                    { label: "findByProps", value: SearchStatus.PROPS },
                    { label: "findComponentByCode", value: SearchStatus.COMPONENT_BY_CODE },
                    { label: "findModuleId", value: SearchStatus.MODULE_ID }
                ]}
                isSelected={value => value === searchType}
                select={changeSearchType}
                serialize={v => String(v)}
            />

            <Forms.FormDivider gap={20} />

            <SectionHeader
                title="Filters"
                tooltip="Multiple filters are AND-matched together."
                description={searchType === SearchStatus.MODULE_ID
                    ? "Only the first input is used for module id search."
                    : "All non-empty filters are applied."}
                className={Margins.top8}
            />

            {filters.map((query, index) => (
                <Flex gap="8px" className={Margins.bottom8} key={index}>
                    <TextInput
                        type="text"
                        value={query}
                        onChange={v => updateFilter(index, v)}
                        placeholder="Filter"
                    />
                    {index > 0 && (
                        <Buttons.Button
                            icon={() => <Icons.TrashIcon color="currentColor" />}
                            variant="critical-secondary"
                            onClick={() => updateFilter(index, null)}
                        />
                    )}
                </Flex>
            ))}

            <Flex gap="8px" flexWrap="wrap" alignItems="center" className={classes(Margins.bottom8, Margins.top8)}>
                <Tooltip text="Append one more filter row">
                    {tooltipProps => (
                        <Buttons.Button
                            {...tooltipProps}
                            onClick={() => setFilters([...filters, ""])}
                            icon={() => <Icons.PlusLargeIcon size="refresh_sm" color="currentColor" />}
                            size="sm"
                            text="Add Filter"
                        />
                    )}
                </Tooltip>

                <Tooltip text={canLog ? "Send matches to console" : "Run a search first"}>
                    {tooltipProps => (
                        <Buttons.Button
                            {...tooltipProps}
                            variant="active"
                            icon={() => <Icons.TopicsIcon size="refresh_sm" color="currentColor" />}
                            size="sm"
                            disabled={!canLog}
                            onClick={() => canLog && logModules(result.matches!)}
                            text={singleMatch ? "Print" : "Log All"}
                        />
                    )}
                </Tooltip>

                <Buttons.Button
                    variant="secondary"
                    size="sm"
                    text="Reset"
                    onClick={reset}
                />
            </Flex>

            {hasStatus && (
                <div
                    style={{
                        color: result.error ? "var(--text-feedback-critical)" : "var(--text-feedback-info)"
                    }}
                >
                    {(() => {
                        const Icon = result.error ? Icons.CircleErrorIcon : Icons.TopicsIcon;
                        return (
                            <Icon
                                size="sm"
                                color="currentColor"
                                style={{ verticalAlign: "middle", marginRight: 6 }}
                            />
                        );
                    })()}
                    <Text color="currentColor" style={{ display: "inline" }}>
                        {result.error || "Find: OK"}
                    </Text>
                </div>
            )}

            {singleMatch && (
                <>
                    <Forms.FormDivider className={Margins.top16} />
                    <SectionHeader
                        title={`Module ${String(singleMatch.id)}`}
                        tooltip="Single module result preview."
                        className={Margins.top16}
                    />
                    <CodeBlock lang="js" content={String(singleMatch.factory)} />
                    <Flex className={Margins.top8} flexWrap="wrap" gap="8px">
                        <Buttons.Button
                            text="Copy Module Code"
                            onClick={() => copyWithToast(String(singleMatch.factory))}
                        />
                        <Buttons.Button
                            text="Copy Module ID"
                            onClick={() => copyWithToast(String(singleMatch.id))}
                        />
                    </Flex>
                </>
            )}
        </SettingsTab>
    );
}

export default (IS_DEV ? SearchHelper : null) as any;
