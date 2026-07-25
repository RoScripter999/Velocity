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

import "./UIElements.css";

import { type ChatBarButtonData, ChatBarButtonMap } from "@api/ChatButtons";
import { type ContextMenuButtonData, ContextMenuButtonMap } from "@api/ContextMenu";
import { type HeaderBarButtonData, HeaderBarButtonMap } from "@api/HeaderBar";
import { type MessagePopoverButtonData, MessagePopoverButtonMap } from "@api/MessagePopover";
import { Settings, type SettingsPluginUiElements, useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Paragraph } from "@components/Paragraph";
import { openPluginModal, SectionHeader, type SectionHeaderProps } from "@components/settings";
import { Switch } from "@components/Switch";
import { classNameFactory } from "@utils/css";
import type { ModalPropsRender } from "@velocity-types";
import { findByCodeLazy } from "@webpack";
import { Icons, Modal, openModal, RichTooltip, ScrollerAuto, TabBar, useCallback, useEffect, useRef, useState } from "@webpack/common";
import type { ComponentType, ReactNode } from "react";

interface RowProps {
    id: string;
    index: number;
    moveRow: (from: number, to: number) => void;
    onContextMenu?: () => void;
    children: ReactNode;
}

interface DragItem {
    id: string;
    index: number;
}

const cl = classNameFactory("vc-plugin-ui-elements-");
const useDrag = findByCodeLazy("useDrag", ".collect");
const useDrop = findByCodeLazy(".dropTargetOptions=", ".collect");

const UI_ELEMENT_TYPE = "ui-element";

function DraggableRow({ id, index, moveRow, onContextMenu, children }: RowProps) {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: UI_ELEMENT_TYPE,
        hover(item: DragItem) {
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const dragParent = document.querySelector(`[data-drag-id="${item.id}"]`)?.closest("section");
            const hoverParent = ref.current?.closest("section");

            if (dragParent !== hoverParent) return;

            moveRow(dragIndex, hoverIndex);
            item.index = hoverIndex;
        }
    });

    const [{ isDragging }, drag] = useDrag({
        type: UI_ELEMENT_TYPE,
        item: { id, index },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging()
        })
    });

    drag(drop(ref));

    return (
        <Card
            ref={ref}
            data-drag-id={id}
            className={cl("switches-row-wrapper")}
            padding="none"
            data-dragging={isDragging}
            onContextMenu={onContextMenu}
            style={{
                cursor: "grab",
                borderColor: isDragging ? "var(--status-positive)" : undefined,
                borderWidth: isDragging ? "2px" : undefined
            }}
        >
            {children}
        </Card>
    );
}


export function getOrderedNames<T extends boolean = false>(buttonMap: Map<string, any>, settings: SettingsPluginUiElements<T>) {
    const known = new Set(buttonMap.keys());

    // Collect all known keys. Prefer keys that already have a saved order.
    const withOrder: Array<{ name: string; order: number; }> = [];
    const withoutOrder: string[] = [];

    for (const name of known) {
        const entry = settings[name];
        if (entry != null && typeof entry === "object" && typeof entry.order === "number") {
            withOrder.push({ name, order: entry.order });
        } else {
            withoutOrder.push(name);
        }
    }

    // Sort by the persisted order value, then append unseen buttons at the end.
    withOrder.sort((a, b) => a.order - b.order);

    return [
        ...withOrder.map(e => e.name),
        ...withoutOrder
    ];
}

export function openUIElementsModal(): void {
    return void openModal(modalProps => <UIElementsModal {...modalProps} />);
}

export function hasUIElements() {
    return getOrderedNames(ChatBarButtonMap, Settings.uiElements.chatBarButtons).length > 0 ||
        getOrderedNames(ContextMenuButtonMap, Settings.uiElements.contextMenuButtons).length > 0 ||
        getOrderedNames(MessagePopoverButtonMap, Settings.uiElements.messagePopoverButtons).length > 0 ||
        getOrderedNames(HeaderBarButtonMap, Settings.uiElements.headerBarButtons).length > 0;
}

export function UIElementsButton() {
    const hasAny = hasUIElements();

    return (
        <div className={cl("button")} onClick={() => hasAny && openUIElementsModal()}>
            <SectionHeader
                title={hasAny ? "Manage UI Elements" : "No UI Elements Available"}
                titleVariant="text-md/semibold"
                titleColor="text-strong"
                descriptionColor="text-muted"
                descriptionVariant="text-sm/normal"
                description={hasAny ? "Reorder and toggle plugin buttons and popover actions" : "No plugins with UI elements are enabled"}
                icon={() => <Icons.SettingsIcon size="md" color="currentColor" />}
                iconWrapperClassName={cl("button-icon")}
                layout="horizontal"
                style={{ flex: 1 }}
            />
            {hasAny && <Icons.ChevronSmallRightIcon size="md" color="var(--icon-muted)" />}
        </div>
    );
}

function EmptyOrder() {
    return (
        <section>
            <Paragraph color="text-muted" className={cl("no-buttons")}>
                You have no plugins enabled that control this section.
            </Paragraph>
        </section>
    );
}

function Section(props: {
    title: string;
    settings: SettingsPluginUiElements<false>;
    icon: ComponentType<any>;
    buttonMap: Map<string, ContextMenuButtonData | HeaderBarButtonData>;
    tooltip?: SectionHeaderProps["tooltip"];
    tooltipIcon?: SectionHeaderProps["tooltipIcon"];
}) {
    const { buttonMap, title, settings, icon, tooltip, tooltipIcon } = props;
    const names = [...buttonMap.keys()];

    const visibleButtons = names.filter(name => {
        const data = buttonMap.get(name);
        if (!data) return false;

        // Native type-narrowing using the 'in' operator
        if ("icon" in data) {
            return !(data.required === true);
        }

        return !data.every(m => m && typeof m === "object" && "required" in m && m.required === true);
    });

    if (visibleButtons.length === 0) {
        return EmptyOrder();
    }

    return (
        <section>
            <SectionHeader
                titleVariant="text-sm/normal"
                title={title}
                titleColor="text-muted"
                margin="bottom20"
                tooltipIcon={tooltipIcon}
                icon={icon}
                tooltip={tooltip}
            />

            <ScrollerAuto fade className={cl("switches")}>
                {visibleButtons.map(name => {
                    const data = buttonMap.get(name);

                    const Icon = data && "icon" in data ? data.icon() : undefined;

                    return (
                        <Card
                            key={name}
                            padding="none"
                            className={cl("switches-row-wrapper")}
                            onContextMenu={() => openPluginModal(Velocity.Plugins.plugins[name])}
                        >
                            <Paragraph size="md" weight="semibold" className={cl("switches-row")}>
                                {Icon && <Icon size="refresh_sm" color="currentColor" height={20} width={20} />}
                                {name}
                                <span style={{ marginLeft: "auto" }}>
                                    <Switch
                                        checked={settings[name] !== false}
                                        onChange={v => {
                                            settings[name] = v;
                                        }}
                                    />
                                </span>
                            </Paragraph>
                        </Card>
                    );
                })}
            </ScrollerAuto>
        </section>
    );
}

function DraggableSection(props: {
    title: string;
    settings: SettingsPluginUiElements<true>;
    icon: ComponentType<any>;
    buttonMap: Map<string, ChatBarButtonData> | Map<string, MessagePopoverButtonData>;
}) {
    const { buttonMap, title, settings, icon } = props;

    const [order, setOrder] = useState(() => getOrderedNames(buttonMap, settings));

    useEffect(() => {
        setOrder(getOrderedNames(buttonMap, settings));
    }, [buttonMap, settings]);

    if (order.length === 0) {
        return EmptyOrder();
    }

    const moveRow = useCallback((from: number, to: number) => {
        setOrder(prev => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);

            // Persist a numeric order on every entry so getOrderedNames
            // can reconstruct the correct sequence on next mount.
            next.forEach((name, index) => {
                settings[name] ??= {} as any;
                settings[name].order = index;
            });

            return next;
        });
    }, [settings]);

    return (
        <section>
            <SectionHeader
                titleVariant="text-sm/normal"
                title={title}
                titleColor="text-muted"
                margin="bottom20"
                icon={icon}
            />
            <ScrollerAuto fade className={cl("switches")}>
                {order.map((name, index) => {
                    const Icon = buttonMap.get(name)?.icon();
                    const isRequired = buttonMap.get(name)?.required === true;

                    return (
                        <DraggableRow
                            onContextMenu={() => openPluginModal(Velocity.Plugins.plugins[name])}
                            key={`${title}-${name}`}
                            id={`${title}-${name}`}
                            index={index}
                            moveRow={moveRow}
                        >
                            <Paragraph size="md" weight="semibold" className={cl("switches-row")}>
                                {Icon && <Icon size="refresh_sm" color="currentColor" height={20} width={20} />}
                                {name}

                                {isRequired ? (
                                    <RichTooltip
                                        title="Cannot Disable"
                                        body="This button can only be moved"
                                        asset={<Icons.DenyIcon />}
                                    >
                                        <span style={{ marginLeft: "auto" }}>
                                            <Switch checked disabled onChange={() => { }} />
                                        </span>
                                    </RichTooltip>
                                ) : (
                                    <span style={{ marginLeft: "auto" }}>
                                        <Switch
                                            checked={settings[name]?.enabled ?? true}
                                            onChange={v => {
                                                settings[name] ??= {} as any;
                                                settings[name].enabled = v;
                                            }}
                                        />
                                    </span>
                                )}
                            </Paragraph>
                        </DraggableRow>
                    );
                })}
            </ScrollerAuto>
        </section>
    );
}

function UIElementsModal(props: ModalPropsRender) {
    const { uiElements } = useSettings(["uiElements.*"]);
    const [activeTab, setActiveTab] = useState<"chatbar" | "popover" | "context" | "headerbar">("chatbar");

    return (
        <Modal
            {...props}
            size="xl"
            title={
                <SectionHeader
                    layout="horizontal"
                    title="UI Elements"
                    titleVariant="text-lg/bold"
                    titleColor="text-strong"
                    description="You can configure which buttons you want to hide or change positions, Buttons appear based on enabled plugins."
                    margin="bottom8"
                />
            }
        >
            <div className={cl("modal-content")}>
                <TabBar
                    type="top"
                    look="brand"
                    orientation="horizontal"
                    selectedItem={activeTab}
                    onItemSelect={setActiveTab}
                >
                    <TabBar.Item id="chatbar">
                        Chatbar Buttons
                    </TabBar.Item>
                    <TabBar.Item id="popover">
                        Message Popover Buttons
                    </TabBar.Item>
                    <TabBar.Item id="headerbar">
                        Header Buttons
                    </TabBar.Item>
                    <TabBar.Item id="context">
                        Context Menu Buttons
                    </TabBar.Item>
                </TabBar>

                {activeTab === "chatbar" && (
                    <DraggableSection
                        title="These are the buttons on the right side of the chat input bar"
                        icon={Icons.ChatIcon}
                        buttonMap={ChatBarButtonMap}
                        settings={uiElements.chatBarButtons}
                    />
                )}

                {activeTab === "popover" && (
                    <DraggableSection
                        title="These are the floating buttons on the right when you hover over a message"
                        icon={Icons.PencilIcon}
                        buttonMap={MessagePopoverButtonMap}
                        settings={uiElements.messagePopoverButtons}
                    />
                )}

                {activeTab === "headerbar" && (
                    <Section
                        title="These are the buttons in the header bar and channel toolbar"
                        icon={Icons.WindowTopIcon}
                        buttonMap={HeaderBarButtonMap}
                        settings={uiElements.headerBarButtons}
                    />
                )}

                {activeTab === "context" && (
                    <Section
                        title="These are buttons added to right-click context menus by plugins"
                        icon={Icons.MenuIcon}
                        buttonMap={ContextMenuButtonMap}
                        settings={uiElements.contextMenuButtons}
                        tooltipIcon={() => <Icons.WarningIcon color="currentColor" size="refresh_sm" />}
                        tooltip={{
                            title: "Some Items are hidden!",
                            body: "Hidden items are required by enabled plugins to function."
                        }}
                    />
                )}
            </div>
        </Modal>
    );
}
