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

import "../styles.css";

import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Icon, Sizes } from "@components/Icons";
import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings";
import { classNameFactory } from "@utils/css";
import { classes, copyToClipboard } from "@utils/misc";
import type { ModalPropsRender } from "@velocity-types";
import { Buttons, Forms, Menu, Modal, openModalLazy, Slider, Text, useMemo, useState } from "@webpack/common";

const cl = classNameFactory("vc-icon-info-");

interface PathInfo {
    d?: string;
    fill?: string;
    fillRule?: string;
    clipRule?: string;
    viewBox?: string;
    index: number;
}

interface Props {
    name: string;
    Component: any;
    modalProps: ModalPropsRender;
}

function renderComponent(Component: any, props: any) {
    const result = Component(props);
    if (typeof result?.type === "function" && result.type.name === "") return result.type(result.props);
    return result;
}

function flattenPaths(node: any): PathInfo[] {
    if (!node) return [];
    if (node.type === "path" && node.props?.d) return [{ ...node.props, index: 0 }];

    const children = node.props?.children;
    if (!children) return [];

    const childArray = Array.isArray(children) ? children : [children];
    return childArray.flatMap(flattenPaths).map((p, i) => ({ ...p, index: i }));
}

function PathCard({ path, index }: { path: PathInfo; index: number; }) {
    const [copied, setCopied] = useState(false);

    function copy() {
        copyToClipboard(path.d ?? "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Card className={cl("path-card")}>
            <Flex alignItems="center" className={Margins.bottom8}>
                <Text variant="text-sm/semibold" color="text-muted" style={{ flex: 1 }}>
                    Path {index + 1}
                </Text>
                <Icon
                    width={32}
                    height={32}
                    fill="currentColor"
                    viewBox={path.viewBox ?? "0 0 24 24"}
                >
                    <path d={path.d} fill={path.fill ?? "currentColor"} fillRule={path.fillRule as any} clipRule={path.clipRule} />
                </Icon>
            </Flex>

            <div className={cl("path-data")}>
                <Text variant="text-xs/normal" color="text-muted">
                    {path.d}
                </Text>
            </div>

            <Flex flexWrap="wrap" gap={8} className={classes(Margins.top8, Margins.bottom8)}>
                {path.fill && (
                    <Text variant="text-xs/normal" color="text-subtle" className={cl("path-attr")}>
                        fill: <code>{path.fill}</code>
                    </Text>
                )}
                {path.fillRule && (
                    <Text variant="text-xs/normal" color="text-subtle" className={cl("path-attr")}>
                        fill-rule: <code>{path.fillRule}</code>
                    </Text>
                )}
                {path.clipRule && (
                    <Text variant="text-xs/normal" color="text-subtle" className={cl("path-attr")}>
                        clip-rule: <code>{path.clipRule}</code>
                    </Text>
                )}
            </Flex>

            <Buttons.Button
                size="sm"
                variant="secondary"
                onClick={copy}
                text={copied ? "Copied!" : "Copy Path"}
            />
        </Card>
    );
}

export function IconInfoModal({ name, Component, modalProps }: Props) {
    const [size, setSize] = useState(24);
    const [copied, setCopied] = useState<"name" | "jsx" | null>(null);

    const paths = useMemo(() => {
        try {
            return flattenPaths(renderComponent(Component, { size: "md", color: "interactive-icon-default" }));
        } catch {
            return [];
        }
    }, [Component]);

    function copyName() {
        copyToClipboard(name);
        setCopied("name");
        setTimeout(() => setCopied(null), 2000);
    }

    function copyJsx() {
        copyToClipboard(`<Icons.${name} size="md" color="currentColor" />`);
        setCopied("jsx");
        setTimeout(() => setCopied(null), 2000);
    }

    const Icon = () => <Component size="custom" width={size} height={size} color="currentColor" />;

    return (
        <Modal size="lg" title={
            <SectionHeader
                title={name}
                titleVariant="text-lg/semibold"
                icon={() => <Component className={cl("header-icon")} />}
                iconWrapperClassName={cl("header-icon-wrapper")}
                layout="horizontal"
            />
        }
            actions={[
                {
                    size: "sm",
                    variant: "secondary",
                    text: copied === "name" ? "Copied!" : "Copy Name",
                    onClick: copyName
                },
                {
                    size: "sm",
                    variant: "secondary",
                    text: copied === "jsx" ? "Copied!" : "Copy JSX",
                    onClick: copyJsx
                }
            ]}
            {...modalProps}
        >

            <div className={cl("content")}>
                <Card className={cl("preview-card")}>
                    <SectionHeader tag="h2" title="Preview" description={`${Math.round(size)}px`} margin="bottom16" />

                    <Slider
                        minValue={12}
                        maxValue={96}
                        initialValue={24}
                        asValueChanges={setSize}
                        value={size}
                        hideBubble
                    />

                    <Buttons.ButtonGroup fullWidth direction="horizontal" className={classes(Margins.top8, Margins.bottom8)}>
                        {Object.entries(Sizes)
                            .filter(([s]) => s !== "custom")
                            .map(([s]) => (
                                <Buttons.Button
                                    key={s}
                                    variant="secondary"
                                    size="sm"
                                    text={s}
                                    onClick={() => setSize(Sizes[s])}
                                />
                            ))}
                    </Buttons.ButtonGroup>

                    <div className={cl("preview-area")}>
                        <Component size="custom" width={size} height={size} color="currentColor" />
                    </div>

                    <SectionHeader tag="h2" title="ContextMenu Preview" margin="bottom8" />
                    <Menu.Menu navId="vc-icons-preview" hideScroller>
                        <Menu.MenuItem id="menu-item" label="Test Item" leadingAccessory={{ type: "icon", icon: Icon }} icon={Icon} />
                        <Menu.MenuItem id="menu-item-disabled" label="Test Item That is disabled" disabled leadingAccessory={{ type: "icon", icon: Icon }} icon={Icon} />
                    </Menu.Menu>
                </Card>

                <Forms.FormTitle tag="h4" className={classes(Margins.top16, Margins.bottom8)}>
                    Paths ({paths.length})
                </Forms.FormTitle>

                <Flex flexDirection="column" gap={8}>
                    {paths.length === 0
                        ? <Text variant="text-sm/normal" color="text-muted">No paths found.</Text>
                        : paths.map((path, i) => <PathCard key={i} path={path} index={i} />)
                    }
                </Flex>
            </div>
        </Modal>
    );
}

export function openIconInfoModal(iconName: string, Component: any) {
    openModalLazy(async () => {
        return modalProps => <IconInfoModal name={iconName} Component={Component} modalProps={modalProps} />;
    });
}
