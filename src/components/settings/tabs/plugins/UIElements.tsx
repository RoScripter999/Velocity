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

import "./UIElements.css";

import { ChatBarButtonMap } from "@api/ChatButtons";
import { ContextMenuButtonData, ContextMenuButtonMap } from "@api/ContextMenu";
import { MessagePopoverButtonMap } from "@api/MessagePopover";
import { type SettingsPluginUiElements, useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { openPluginModal, SectionHeader } from "@components/settings";
import { Switch } from "@components/Switch";
import { classNameFactory } from "@utils/css";
import { ModalCloseButton, ModalContent, ModalHeader, type ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { IconComponent } from "@utils/types";
import { findByCodeLazy } from "@webpack";
import { Icons, RichTooltip, Text, useCallback, useEffect, useRef, useState } from "@webpack/common";
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

export function DraggableRow({ id, index, moveRow, onContextMenu, children }: RowProps) {
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


export function getOrderedNames(buttonMap: Map<string, any>, settings: SettingsPluginUiElements) {
    const known = new Set(buttonMap.keys());

    // Collect all known keys. Prefer keys that already have a saved order.
    const withOrder: Array<{ name: string; order: number; }> = [];
    const withoutOrder: string[] = [];

    for (const name of known) {
        const entry = settings[name];
        if (entry != null && typeof entry.order === "number") {
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

export function UIElementsButton() {
    const { uiElements } = useSettings(["uiElements.*"]);

    const chatBarOrder = getOrderedNames(ChatBarButtonMap, uiElements.chatBarButtons);
    const popoverOrder = getOrderedNames(MessagePopoverButtonMap, uiElements.messagePopoverButtons);
    const hasAny = chatBarOrder.length > 0 || popoverOrder.length > 0;

    return (
        <div className={cl("button")} onClick={() => hasAny && openModal(modalProps => <UIElementsModal {...modalProps} />)}>
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

function ContextMenuSection(props: {
    title: string;
    description: string;
    settings: SettingsPluginUiElements;
    icon: ComponentType<any>;
    buttonMap: Map<string, ContextMenuButtonData>;
}) {
    const { buttonMap, description, title, settings, icon } = props;
    const names = [...buttonMap.keys()];

    if (names.length === 0) return null;

    return (
        <section>
            <SectionHeader
                tag="h3"
                titleVariant="heading-xl/bold"
                title={title}
                description={description}
                descriptionVariant="text-sm/normal"
                className={Margins.bottom20}
                icon={icon}
                tooltipIcon={() => <Icons.WarningIcon color="currentColor" size="refresh_sm" />}
                tooltip={{
                    asset: <Icons.WarningIcon color="var(--icon-feedback-warning)" size="lg" />, title: "Some Items are hidden!", body: <Text variant="text-sm/normal" color="text-subtle">
                        Hidden items are required by active plugins to function.
                    </Text>
                }}
            />

            <div className={cl("switches")}>
                {names.map(name => {
                    const data = buttonMap.get(name);

                    const isRequired = Object.values(data?.menus ?? {}).every(
                        m => m.required === true
                    );

                    if (isRequired) return null;

                    return (
                        <Card
                            key={name}
                            className={cl("switches-row-wrapper")}
                            onContextMenu={() => openPluginModal(Velocity.Plugins.plugins[name])}
                        >
                            <Paragraph
                                size="md"
                                weight="semibold"
                                className={cl("switches-row")}
                            >
                                {name}

                                <span style={{ marginLeft: "auto" }}>
                                    <Switch
                                        checked={settings[name]?.enabled ?? true}
                                        onChange={v => {
                                            settings[name] ??= {} as any;
                                            settings[name].enabled = v;
                                        }}
                                    />
                                </span>
                            </Paragraph>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}

function Section(props: {
    title: string;
    description: string;
    settings: SettingsPluginUiElements;
    icon: ComponentType<any>;
    buttonMap: Map<string, { icon: IconComponent; required?: boolean; }>;
}) {
    const { buttonMap, description, title, settings, icon } = props;

    const [order, setOrder] = useState(() => getOrderedNames(buttonMap, settings));

    useEffect(() => {
        setOrder(getOrderedNames(buttonMap, settings));
    }, [buttonMap, settings]);

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
                tag="h3"
                titleVariant="heading-xl/bold"
                title={title}
                description={description}
                descriptionVariant="text-sm/normal"
                className={Margins.bottom20}
                icon={icon}
            />
            <div className={cl("switches")}>
                {order.map((name, index) => {
                    const Icon = buttonMap.get(name)!.icon ?? Icons.UnknownGameIcon;
                    const isRequired = buttonMap.get(name)?.required === true;

                    return (
                        <DraggableRow onContextMenu={() => openPluginModal(Velocity.Plugins.plugins[name])} key={`${title}-${name}`} id={`${title}-${name}`} index={index} moveRow={moveRow}>
                            <Paragraph size="md" weight="semibold" className={cl("switches-row")}>
                                <Icon height={20} width={20} />
                                {name}

                                {isRequired ? (
                                    <RichTooltip
                                        title="Cannot Disable"
                                        body="This plugin is required to have this button."
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
            </div>
        </section>
    );
}

function UIElementsModal(props: ModalProps) {
    const { uiElements } = useSettings(["uiElements.*"]);

    return (
        <ModalRoot {...props} size={ModalSize.MEDIUM}>
            <ModalHeader>
                <SectionHeader
                    layout="horizontal"
                    title="UI Elements"
                    titleVariant="text-lg/bold"
                    titleColor="text-strong"
                    description="Drag to reorder · Right-Click to open plugin settings"
                    tooltip="You can configure which buttons you want to hide or change positions, Buttons appear based on enabled plugins."
                    margin="bottom8"
                    style={{ flex: 1 }}
                />
                <ModalCloseButton onClick={props.onClose} />
            </ModalHeader>
            <ModalContent className={cl("modal-content")}>
                <Section
                    title="Chatbar Buttons"
                    description="These are the buttons on the right side of the chat input bar"
                    icon={Icons.ChatIcon}
                    buttonMap={ChatBarButtonMap}
                    settings={uiElements.chatBarButtons}
                />
                <Section
                    title="Message Popover Buttons"
                    description="These are the floating buttons on the right when you hover over a message"
                    icon={Icons.PencilIcon}
                    buttonMap={MessagePopoverButtonMap}
                    settings={uiElements.messagePopoverButtons}
                />
                <ContextMenuSection
                    title="Context Menu Items"
                    description="These are items added to right-click context menus by plugins"
                    icon={Icons.ListBulletsIcon}
                    buttonMap={ContextMenuButtonMap}
                    settings={uiElements.contextMenuButtons}
                />
            </ModalContent>
        </ModalRoot>
    );
}
