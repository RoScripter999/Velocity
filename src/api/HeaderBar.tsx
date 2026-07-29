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

import ErrorBoundary from "@components/ErrorBoundary";
import { Logger } from "@utils/Logger";
import { classes } from "@utils/misc";
import { useForceUpdater } from "@utils/react";
import type { IconComponent } from "@utils/types";
import { findComponentByCodeLazy, findCssClassesLazy } from "@webpack";
import { Clickable, Tooltip, useEffect } from "@webpack/common";
import type { ComponentType, JSX, MouseEventHandler, ReactNode, RefObject } from "react";

import { Settings, useSettings } from "./Settings";

const logger = new Logger("HeaderBarAPI");

const HeaderBarClasses = findCssClassesLazy("clickable", "selected", "badge", "badgeContainer");
const HeaderBarIcon = findComponentByCodeLazy(".HEADER_BAR_BADGE_TOP:", '"aria-haspopup":') as ComponentType<ChannelToolbarButtonProps>;

export interface HeaderBarButtonProps {
    /** The icon component to render inside the button */
    icon: ComponentType<any>;
    /** Tooltip text shown on hover. Pass null to disable tooltip */
    tooltip: ReactNode;
    /** Called when the button is clicked */
    onClick?: MouseEventHandler<HTMLDivElement>;
    /** Called when the button is right-clicked */
    onContextMenu?: MouseEventHandler<HTMLDivElement>;
    /** Additional CSS class names */
    className?: string;
    /** Size of the icon in pixels */
    iconSize?: number;
    /** Tooltip position relative to the button */
    position?: "top" | "bottom" | "left" | "right";
    /** Whether the button appears in a selected/active state */
    selected?: boolean;
    /** Aria label for accessibility */
    "aria-label"?: string;
}

export interface ChannelToolbarButtonProps extends HeaderBarButtonProps {
    /** CSS class name for the icon element */
    iconClassName?: string;
    /** Tooltip position relative to the button */
    position?: "top" | "bottom" | "left" | "right";
    /** Whether the button appears in a selected/active state */
    selected?: boolean;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Whether to show a notification badge */
    showBadge?: boolean;
    /** Position of the notification badge */
    badgePosition?: "top" | "bottom";
}

export type HeaderBarButtonFactory = () => JSX.Element | null;

export interface HeaderBarButtonData {
    /** Function that renders the button component */
    readonly render: HeaderBarButtonFactory;
    /** Icon component used for settings UI display */
    readonly icon: () => IconComponent;
    /** Higher priority buttons appear further right. Default: 0 */
    readonly priority?: number;
    /** Where to render the button. Default: "headerbar" */
    readonly location?: "headerbar" | "channeltoolbar";
    readonly required?: boolean;
}

/**
 * Button component for the top header bar (title bar area).
 *
 * @example
 * <HeaderBarButton
 *     icon={MyIcon}
 *     tooltip="My Button"
 *     onClick={() => console.log("clicked")}
 * />
 */
export function HeaderBarButton(props: HeaderBarButtonProps & { ref?: RefObject<any>; }) {
    const {
        icon: Icon,
        tooltip,
        onClick,
        onContextMenu,
        className,
        iconSize = 18,
        position = "bottom",
        selected,
        ref,
        "aria-label": ariaLabel
    } = props;

    const label = ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined);

    return (
        <Tooltip text={tooltip ?? ""} position={position} shouldShow={tooltip != null}>
            {({ onMouseEnter, onMouseLeave }) => (
                <Clickable
                    {...{ innerRef: ref }}
                    className={classes(HeaderBarClasses.clickable, className)}
                    style={{ width: iconSize, boxSizing: "content-box", justifyContent: "center" }}
                    onClick={onClick}
                    onContextMenu={onContextMenu}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    aria-expanded={selected}
                >
                    <Icon size="custom" width={iconSize} height={iconSize} color="currentColor" />
                </Clickable>
            )}
        </Tooltip>
    );
}

/**
 * Button component for the channel toolbar (below the search bar).
 * Automatically handles selected state styling.
 *
 * @example
 * <ChannelToolbarButton
 *     icon={MyIcon}
 *     tooltip={isOpen ? null : "My Button"}
 *     onClick={() => setOpen(v => !v)}
 *     selected={isOpen}
 * />
 */
export function ChannelToolbarButton(props: ChannelToolbarButtonProps) {
    return <HeaderBarIcon {...props} />;
}

export const HeaderBarButtonMap = new Map<string, HeaderBarButtonData>();
export const ChannelToolbarButtonMap = new Map<string, HeaderBarButtonData>();

const headerBarListeners = new Set<() => void>();
const channelToolbarListeners = new Set<() => void>();

/**
 * Adds a button to the header bar (title bar area).
 *
 * @param identifier - Unique identifier for the button (e.g., "my-plugin-button")
 * @param render - Function that returns the button JSX
 * @param icon - Icon component used for settings UI display
 * @param priority - Higher values appear further right. Default: 0
 *
 * @example
 * addHeaderBarButton("my-button", () => (
 *     <HeaderBarButton
 *         icon={MyIcon}
 *         tooltip="My Button"
 *         onClick={handleClick}
 *     />
 * ), MyIcon);
 */
export function addHeaderBarButton(identifier: string, render: HeaderBarButtonFactory, icon: () => IconComponent, priority = 0, required = false) {
    const data = Object.freeze({ render, icon, priority, required });
    HeaderBarButtonMap.set(identifier, data);

    if (!required) {
        Settings.uiElements.headerBarButtons[identifier] = true;
    }

    headerBarListeners.forEach(listener => listener());
}

/**
 * Removes a button from the header bar.
 *
 * @param identifier - The identifier used when adding the button
 */
export function removeHeaderBarButton(identifier: string) {
    HeaderBarButtonMap.delete(identifier);
    headerBarListeners.forEach(listener => listener());
}

/**
 * Adds a button to the channel toolbar (below the search bar, next to pins/members).
 *
 * @param identifier - Unique identifier for the button (e.g., "my-plugin-toolbar")
 * @param render - Function that returns the button JSX
 * @param icon - Icon component used for settings UI display
 * @param priority - Higher values appear further right. Default: 0
 *
 * @example
 * addChannelToolbarButton("my-toolbar", () => (
 *     <ChannelToolbarButton
 *         icon={MyIcon}
 *         tooltip="My Button"
 *         onClick={handleClick}
 *     />
 * ), MyIcon);
 */
export function addChannelToolbarButton(identifier: string, render: HeaderBarButtonFactory, icon: () => IconComponent, priority = 0, required = false) {
    const data = Object.freeze({ render, icon, priority, required });
    ChannelToolbarButtonMap.set(identifier, data);

    if (!required) {
        Settings.uiElements.headerBarButtons[identifier] = true;
    }

    channelToolbarListeners.forEach(listener => listener());
}

/**
 * Removes a button from the channel toolbar.
 *
 * @param identifier - The identifier used when adding the button
 */
export function removeChannelToolbarButton(identifier: string) {
    ChannelToolbarButtonMap.delete(identifier);
    channelToolbarListeners.forEach(listener => listener());
}

function ToolbarButtons({ type }: { type: "header" | "channel"; }) {
    const forceUpdate = useForceUpdater();
    const { uiElements } = useSettings(["uiElements.headerBarButtons.*"]);

    const map = type === "header" ? HeaderBarButtonMap : ChannelToolbarButtonMap;

    useEffect(() => {
        const listener = () => forceUpdate();
        (type === "header" ? headerBarListeners : channelToolbarListeners).add(listener);
        return () => {
            (type === "header" ? headerBarListeners : channelToolbarListeners).delete(listener);
        };
    }, [forceUpdate, type]);

    return Array.from(map)
        .filter(([id, data]) => {
            if (!data.required && uiElements.headerBarButtons[id] === false) return false;
            return true;
        })
        .sort(([, a], [, b]) => (a.priority ?? 0) - (b.priority ?? 0))
        .map(([id, { render: Button }]) => (
            <ErrorBoundary noop key={id} onError={e => logger.error(`Failed to render ${type} button: ${id}`, e.error)}>
                <Button />
            </ErrorBoundary>
        ));
}

/** @internal Injected by HeaderBarAPI patch (do NOT call directly) */
export function _addHeaderBarButtons() {
    return [<ToolbarButtons type="header" key="vc-header-bar-buttons" />];
}

/** @internal Injected by HeaderBarAPI patch (do NOT call directly) */
export function _addChannelToolbarButtons(toolbar: ReactNode[]) {
    toolbar.push(<ToolbarButtons type="channel" key="vc-channel-toolbar-buttons" />);
}
