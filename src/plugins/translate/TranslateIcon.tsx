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

import { ChatBarButton, type ChatBarButtonFactory } from "@api/ChatButtons";
import type { ModalPropsRender } from "@velocity-types";
import { ConfirmModal, Icons, openModal, Tooltip, useEffect, useState } from "@webpack/common";

import { settings } from "./settings";
import { TranslateModal } from "./TranslateModal";
import { cl } from "./utils";

export let setShouldShowTranslateEnabledTooltip: undefined | ((show: boolean) => void);

function AutoTranslateConfirmModal(props: ModalPropsRender) {
    const s = settings.use(["dismissedAutoTranslateAlert"]);

    return (
        <ConfirmModal
            {...props}
            title="Auto-Translate Enabled"
            subtitle="You just enabled Auto Translate! Any message will automatically be translated before being sent."
            confirmText="Disable Auto-Translate"
            onConfirm={() => settings.store.autoTranslate = false}
            cancelText="Got it"
            variant="primary"
            checkboxProps={{
                checked: s.dismissedAutoTranslateAlert === true,
                onChange: checked => s.dismissedAutoTranslateAlert = checked
            }}
        />
    );
}

export const TranslateChatBarIcon: ChatBarButtonFactory = ({ isMainChat }) => {
    const { autoTranslate, showChatBarButton } = settings.use(["autoTranslate", "showChatBarButton"]);

    const [shouldShowTranslateEnabledTooltip, setter] = useState(false);
    useEffect(() => {
        setShouldShowTranslateEnabledTooltip = setter;
        return () => setShouldShowTranslateEnabledTooltip = undefined;
    }, []);

    if (!isMainChat || !showChatBarButton) return null;

    const toggle = () => {
        const newState = !autoTranslate;
        settings.store.autoTranslate = newState;
        if (newState && !settings.store.dismissedAutoTranslateAlert)
            openModal(props => <AutoTranslateConfirmModal {...props} />);
    };

    const button = (
        <ChatBarButton
            tooltip="Open Translate Modal"
            onClick={e => {
                if (e.shiftKey) return toggle();

                openModal(props => (
                    <TranslateModal rootProps={props} />
                ));
            }}
            onContextMenu={toggle}
            buttonProps={{
                "aria-haspopup": "dialog"
            }}
        >
            <Icons.LanguageIcon color="currentColor" className={cl({ "auto-translate": autoTranslate, "chat-button": true })} />
        </ChatBarButton>
    );

    if (shouldShowTranslateEnabledTooltip && settings.store.showAutoTranslateTooltip)
        return (
            <Tooltip text="Auto Translate Enabled" forceOpen>
                {() => button}
            </Tooltip>
        );

    return button;
};
