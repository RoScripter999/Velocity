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

import { Card } from "@components/Card";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { SectionHeader } from "@components/settings";
import { OptionComponentMap } from "@components/settings/tabs/plugins/components";
import { debounce } from "@shared/debounce";
import { sendMessage } from "@utils/discord";
import { OptionType, type PluginSettingDef } from "@utils/types";
import type { ModalPropsRender, User } from "@velocity-types";
import { Avatar, Buttons, Icons, IconUtils, Modal, SearchBar, Select, SelectedChannelStore, Text, useMemo, useState } from "@webpack/common";

import { Categories, cl, encodeCommand } from "./utils";

export interface Action {
    id: string;
    label: string;
    description: string;
    category?: Categories;
    predicate?: (selfId: string) => boolean;
    options?: Record<string, PluginSettingDef>;
    execute: (options: Record<string, any>) => void | Promise<void>;
}

interface PanelProps extends ModalPropsRender {
    actions: Action[];
    target: User;
}

export function ControlsPanel({ actions, target, ...modalProps }: PanelProps) {
    const [expandedAction, setExpandedAction] = useState<string | null>(null);
    const [optionValues, setOptionValues] = useState<Record<string, Record<string, any>>>(() =>
        Object.fromEntries(actions
            .filter(a => a.options)
            .map(a => [
                a.id,
                Object.fromEntries(Object.entries(a.options!).map(([k, v]) => [k, v.default ?? ""]))
            ])
        )
    );

    const [searchQuery, setsSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const categoryOptions = useMemo(() => {
        const categories = new Set<string>();
        actions.forEach(action => {
            categories.add(action.category ?? "General");
        });
        return [
            { label: "All Categories", value: "All" },
            ...Array.from(categories).map(cat => ({
                label: cat,
                value: cat,
                id: cat
            }))
        ];
    }, [actions]);

    const filteredActions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return actions.filter(action => {
            const matchesSearch = !query ||
                action.label.toLowerCase().includes(query) ||
                action.description.toLowerCase().includes(query);

            const actionCategory = action.category ?? "General";
            const matchesCategory = selectedCategory === "All" || actionCategory === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [actions, searchQuery, selectedCategory]);

    const grouped = useMemo(() => {
        return Object.entries(
            filteredActions.reduce<Record<string, Action[]>>((acc, action) => {
                const key = action.category ?? "General";
                (acc[key] ??= []).push(action);
                return acc;
            }, {})
        );
    }, [filteredActions]);

    const modalTitle = useMemo(() => (
        <SectionHeader
            tag="h2"
            titleVariant="heading-lg/semibold"
            titleColor="text-strong"
            layout="horizontal"
            icon={() => (
                <Avatar
                    avatarDecoration={IconUtils.getAvatarDecorationURL({
                        avatarDecoration: target.avatarDecorationData,
                        size: 80,
                        canAnimate: true
                    })}
                    size="SIZE_48"
                    src={IconUtils.getUserAvatarURL(target, true, 80)}
                />
            )}
            title="Control Panel"
            description={target.username}
        />
    ), [target]);

    return (
        <Modal title={modalTitle} size="lg" {...modalProps}>
            <div>
                <Text variant="text-md/semibold">Search Filters</Text>
                <div className={cl("modal-top")}>
                    <SearchBar placeholder="Search for an action..." query={searchQuery} onChange={setsSearchQuery} autoFocus />
                    <Select
                        options={categoryOptions}
                        value={selectedCategory}
                        onSelectionChange={setSelectedCategory}
                    />
                </div>

                {filteredActions.length === 0 ? (
                    <Text className={cl("modal-no-search")} variant="text-md/medium" color="text-muted">No actions found for "{searchQuery}"</Text>
                ) : (
                    grouped.map(([category, categoryActions]) => (
                        <Flex key={category} flexDirection="column" gap="8px">
                            <SectionHeader margin="top8" tag="h2" titleColor="text-subtle" titleVariant="text-md/semibold" title={category} />
                            <div className={cl("modal-grid")}>
                                {categoryActions.map(action => {
                                    const isExpanded = expandedAction === action.id;
                                    const hasOptions = !!action.options;
                                    const optionVals = optionValues[action.id] ?? {};

                                    return (
                                        <Card key={action.id} padding="sm" className={isExpanded && hasOptions ? cl("modal-grid-full") : undefined}>
                                            <Flex justifyContent="space-between" alignItems="center" gap="8px">
                                                <SectionHeader tag="h2" title={action.label} description={action.description} descriptionColor="text-default" />
                                                <Flex gap="4px" alignItems="center">
                                                    {hasOptions && (
                                                        <div className={cl("modal-chevron", isExpanded && "modal-chevron-expanded")}>
                                                            <Buttons.IconButton
                                                                variant="secondary"
                                                                size="sm"
                                                                icon={Icons.ChevronSmallRightIcon}
                                                                onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                                                            />
                                                        </div>
                                                    )}
                                                    <Buttons.Button
                                                        text="Run"
                                                        size="sm"
                                                        disabled={action.predicate ? !action.predicate(target.id) : false}
                                                        onClick={() => sendMessage(SelectedChannelStore.getChannelId(), { content: encodeCommand(action.id, hasOptions ? optionVals : undefined) })}
                                                    />
                                                </Flex>
                                            </Flex>

                                            {isExpanded && hasOptions && (
                                                <div className={cl("modal-options")}>
                                                    {Object.entries(action.options!).map(([key, setting]) => {
                                                        if (setting.type === OptionType.CUSTOM || setting.hidden) return null;
                                                        const Component = OptionComponentMap[setting.type];

                                                        return (
                                                            <ErrorBoundary noop key={key}>
                                                                <Component
                                                                    id={key}
                                                                    definedSettings={undefined!}
                                                                    setting={setting}
                                                                    onChange={setting.type === OptionType.BOOLEAN
                                                                        ? v => setOptionValues(prev => ({ ...prev, [action.id]: { ...prev[action.id], [key]: v } }))
                                                                        : debounce(v => setOptionValues(prev => ({ ...prev, [action.id]: { ...prev[action.id], [key]: v } })))
                                                                    }
                                                                    pluginSettings={{ ...optionVals, enabled: true }}
                                                                    closePluginSettings={() => { }}
                                                                />
                                                            </ErrorBoundary>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </Flex>
                    ))
                )}
            </div>
        </Modal>
    );
}
