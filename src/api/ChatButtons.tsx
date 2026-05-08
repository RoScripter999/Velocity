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

import "./ChatButton.css";

import ErrorBoundary from "@components/ErrorBoundary";
import { getOrderedNames } from "@components/settings/tabs/plugins/UIElements";
import { Logger } from "@utils/Logger";
import { classes } from "@utils/misc";
import type { IconComponent } from "@utils/types";
import type { Channel } from "@velocity-types";
import { findCssClassesLazy } from "@webpack";
import { Clickable, Menu, Tooltip } from "@webpack/common";
import type { HTMLProps, JSX, MouseEventHandler, ReactNode } from "react";

import { addContextMenuPatch, findGroupChildrenByChildId } from "./ContextMenu";
import { useSettings } from "./Settings";

const ButtonWrapperClasses = findCssClassesLazy("button", "buttonWrapper", "notificationDot");
const ChannelTextAreaClasses = findCssClassesLazy("buttonContainer", "channelTextArea", "button");

export interface ChatBarProps {
    channel: Channel;
    disabled: boolean;
    isEmpty: boolean;
    type: {
        analyticsName: string;
        attachments: boolean;
        autocomplete: {
            addReactionShortcut: boolean,
            forceChatLayer: boolean,
            reactions: boolean;
        },
        commands: {
            enabled: boolean;
        },
        drafts: {
            type: number,
            commandType: number,
            autoSave: boolean;
        },
        emojis: {
            button: boolean;
        },
        gifs: {
            button: boolean,
            allowSending: boolean;
        },
        gifts: {
            button: boolean;
        },
        permissions: {
            requireSendMessages: boolean;
        },
        showThreadPromptOnReply: boolean,
        stickers: {
            button: boolean,
            allowSending: boolean,
            autoSuggest: boolean;
        },
        users: {
            allowMentioning: boolean;
        },
        submit: {
            button: boolean,
            ignorePreference: boolean,
            disableEnterToSubmit: boolean,
            clearOnSubmit: boolean,
            useDisabledStylesOnSubmit: boolean;
        },
        uploadLongMessages: boolean,
        upsellLongMessages: {
            iconOnly: boolean;
        },
        showCharacterCount: boolean,
        sedReplace: boolean;
    };
}

export type ChatBarButtonFactory = (props: ChatBarProps & { isMainChat: boolean; isAnyChat: boolean; }) => JSX.Element | null;
export type ChatBarButtonData = {
    render: ChatBarButtonFactory;
    /**
     * This icon is used only for Settings UI. Your render function must still render an icon,
     * and it can be different from this one.
     */
    icon: IconComponent;
    required?: boolean;
};

/**
 * Don't use this directly, use {@link addChatBarButton} and {@link removeChatBarButton} instead.
 */
export const ChatBarButtonMap = new Map<string, ChatBarButtonData>();
const logger = new Logger("ChatButtons");

function VelocityChatBarButtons(props: ChatBarProps) {
    const { chatBarButtons } = useSettings(["uiElements.chatBarButtons.*"]).uiElements;

    const orderedKeys = getOrderedNames(ChatBarButtonMap, chatBarButtons);
    const { analyticsName } = props.type;

    return (
        <>
            {orderedKeys.map(key => {
                const data = ChatBarButtonMap.get(key);
                if (!data) return null;

                const required = data.required ?? false;

                // required buttons must ignore persisted disabled state.
                if (chatBarButtons[key]?.enabled === false && !required) return null;
                const Button = data.render;

                return (
                    <ErrorBoundary
                        noop
                        key={key}
                        onError={e =>
                            logger.error(`Failed to render ${key}`, e.error)
                        }
                    >
                        <Button
                            {...props}
                            isMainChat={analyticsName === "normal"}
                            isAnyChat={["normal", "sidebar"].includes(analyticsName)}
                        />
                    </ErrorBoundary>
                );
            })}
        </>
    );
}

export function _injectButtons(buttons: ReactNode[], props: ChatBarProps) {
    if (props.disabled || buttons.length === 0) return;

    buttons.unshift(<VelocityChatBarButtons key="velocity-chat-buttons" {...props} />);

    return buttons;
}

/**
 * The icon argument is used only for Settings UI. Your render function must still render an icon,
 * and it can be different from this one.
 */
export const addChatBarButton = (id: string, render: ChatBarButtonFactory, icon: IconComponent, required: boolean) => ChatBarButtonMap.set(id, { render, icon, required });
export const removeChatBarButton = (id: string) => ChatBarButtonMap.delete(id);

export interface ChatBarButtonProps {
    children: ReactNode;
    tooltip: string;
    onClick: MouseEventHandler;
    onContextMenu?: MouseEventHandler;
    onAuxClick?: MouseEventHandler;
    buttonProps?: Omit<HTMLProps<HTMLDivElement>, "size" | "onClick" | "onContextMenu" | "onAuxClick">;
}

export const ChatBarButton = ErrorBoundary.wrap((props: ChatBarButtonProps) => {
    return (
        <Tooltip text={props.tooltip}>
            {({ onMouseEnter, onMouseLeave }) => (
                <div className={`expression-picker-chat-input-button ${ChannelTextAreaClasses?.buttonContainer ?? ""} vc-chatbar-button`}>
                    <Clickable
                        aria-label={props.tooltip}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        className={classes(ButtonWrapperClasses.button, ChannelTextAreaClasses?.button)}
                        onClick={props.onClick}
                        onContextMenu={props.onContextMenu}
                        onAuxClick={props.onAuxClick}
                        {...props.buttonProps}
                    >
                        <div className={ButtonWrapperClasses.buttonWrapper}>
                            {props.children}
                        </div>
                    </Clickable>
                </div>
            )}
        </Tooltip>
    );
}, { noop: true });

addContextMenuPatch("textarea-context", (children, args) => {
    const { chatBarButtons } = useSettings(["uiElements.chatBarButtons.*"]).uiElements;

    const buttons = Array.from(ChatBarButtonMap.entries());
    if (!buttons.length) return;

    const group = findGroupChildrenByChildId("submit-button", children);
    if (!group) return;

    const idx = group.findIndex(c => c?.props?.id === "submit-button");
    if (idx === -1) return;

    group.splice(idx, 0,
        <Menu.MenuItem id="vc-chat-buttons" key="velocity-chat-buttons" label="Velocity Buttons">
            {buttons.map(([id]) => (
                <Menu.MenuCheckboxItem
                    label={id}
                    key={id}
                    id={`vc-chat-button-${id}`}
                    checked={chatBarButtons[id]?.enabled !== false}
                    action={() => {
                        const wasEnabled = chatBarButtons[id]?.enabled !== false;

                        chatBarButtons[id] ??= {} as any;
                        chatBarButtons[id].enabled = !wasEnabled;
                    }}
                />
            ))}
        </Menu.MenuItem>
    );
});
