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

import type { CategoryNode, ContentNode, CustomNode, NestedPanelNode, PanelNode, SectionNode, SidebarItemNode, StaticNode, TabItemNode, ToggleNode } from "@velocity-types";
import { LayoutType } from "@velocity-types/enums";
import type { JSX, ReactNode } from "react";

function factory<TProps extends {}, TReturn>(fn: (props: TProps) => TReturn): (props: TProps) => TReturn & JSX.Element {
    return Object.assign(fn, { __velocitySettingsFactory: true }) as unknown as (props: TProps) => TReturn & JSX.Element;
}

function toChildren<T>(children: any): T[] {
    if (children == null) return [];
    return (Array.isArray(children) ? children.flat() : [children]) as T[];
}

export const Section = factory(function Section({ title, hoisted, children }: {
    title?: ReactNode;
    hoisted?: boolean;
    children?: any;
}): SectionNode {
    return {
        type: LayoutType.SECTION,
        hoisted,
        useTitle: title !== undefined ? () => title : undefined,
        buildLayout: () => toChildren<SidebarItemNode>(children)
    };
});

export const SidebarButton = factory(function SidebarButton({ title, children, ...props }: Omit<SidebarItemNode, "type" | "buildLayout" | "useTitle"> & { title: string; children?: any; }): SidebarItemNode {
    return {
        ...props,
        type: LayoutType.SIDEBAR_ITEM,
        useTitle: () => title,
        buildLayout: () => toChildren<PanelNode>(children)
    };
});

export const Panel = factory(function Panel({ title, children, ...props }: Omit<PanelNode, "type" | "buildLayout" | "useTitle"> & { title: string; children?: any; }): PanelNode {
    return {
        ...props,
        type: LayoutType.PANEL,
        useTitle: () => title,
        buildLayout: () => toChildren<CategoryNode | TabItemNode>(children)
    };
});

export const Category = factory(function Category({ title, children, ...props }: Omit<CategoryNode, "type" | "buildLayout" | "useTitle"> & { title?: string; children?: any; }): CategoryNode {
    return {
        ...props,
        type: LayoutType.CATEGORY,
        useTitle: title !== undefined ? () => title : undefined,
        buildLayout: () => toChildren<ContentNode>(children)
    };
});

export const Custom = factory(function Custom({ ...props }: Omit<CustomNode, "type">): CustomNode {
    return { ...props, type: LayoutType.CUSTOM };
});

export const NestedPanel = factory(function NestedPanel({ title, subtitle, children, ...props }: Omit<NestedPanelNode, "type" | "buildLayout" | "useTitle" | "useSubtitle"> & { title: string; subtitle?: string; children?: any; }): NestedPanelNode {
    return {
        ...props,
        type: LayoutType.NESTED_PANEL,
        useTitle: () => title,
        useSubtitle: subtitle !== undefined ? () => subtitle : undefined,
        buildLayout: () => toChildren<PanelNode>(children)
    };
});

export const TabItem = factory(function TabItem({ title, children, ...props }: Omit<TabItemNode, "type" | "layout" | "getTitle"> & { title: string; children?: any; }): TabItemNode {
    return { ...props, type: LayoutType.TAB_ITEM, getTitle: () => title, layout: toChildren<ContentNode>(children) };
});

export const Text = factory(function Text({ title, subtitle, ...props }: Omit<StaticNode, "type" | "useTitle" | "useSubtitle"> & { title: string; subtitle?: string; }): StaticNode {
    return {
        ...props,
        type: LayoutType.STATIC,
        useTitle: () => title,
        useSubtitle: subtitle !== undefined ? () => subtitle : undefined
    };
});

export const Toggle = factory(function Toggle({ title, subtitle, ...props }: Omit<ToggleNode, "type" | "useTitle" | "useSubtitle"> & { title: string; subtitle?: string; }): ToggleNode {
    return {
        ...props,
        type: LayoutType.TOGGLE,
        useTitle: () => title,
        useSubtitle: subtitle !== undefined ? () => subtitle : undefined
    };
});
