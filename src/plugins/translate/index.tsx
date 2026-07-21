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

import "./styles.css";

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import type { DiscordLocale, Message } from "@velocity-types";
import { findLazy } from "@webpack";
import { i18n, Menu } from "@webpack/common";

import { settings } from "./settings";
import { setShouldShowTranslateEnabledTooltip, TranslateChatBarIcon, TranslateIcon } from "./TranslateIcon";
import { handleTranslate, TranslationAccessory } from "./TranslationAccessory";
import { cl, translate } from "./utils";

// please someone get better find than this.
const iconGetter = findLazy(m => typeof m === "function" && typeof m.resolve === "function" && typeof m.keys === "function" && m.keys()?.includes("./en-US.png"));

const messageCtxPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message; }) => {
    const content = getMessageContent(message);
    if (!content) return;

    const group = findGroupChildrenByChildId("copy-text", children);
    if (!group) return;

    group.splice(group.findIndex(c => c?.props?.id === "copy-text") + 1, 0, (
        <Menu.MenuItem
            id="vc-trans"
            label="Translate"
            leadingAccessory={{ type: "icon", icon: TranslateIcon }}
            action={async () => {
                const trans = await translate("received", content);
                handleTranslate(message.id, trans);
            }}
        >
            {i18n.getAvailableLocales().map((locale: { value: DiscordLocale; name: string; }) => {
                // half of this is copied from discord
                const flagSrc: string = iconGetter(`./${locale.value}.png`);

                return (
                    <Menu.MenuItem
                        key={locale.value}
                        id={`vc-trans-${locale.value}`}
                        label={locale.name}
                        icon={() => <img alt="" className={cl("flag-icon")} src={flagSrc} />}
                        leadingAccessory={{ type: "image", src: flagSrc }}
                        action={async () => {
                            const trans = await translate("received", content, locale.value);
                            handleTranslate(message.id, trans);
                        }}
                    />
                );
            })}
        </Menu.MenuItem>
    ));
};


function getMessageContent(message: Message) {
    // Message snapshots is an array, which allows for nested snapshots, which Discord does not do yet.
    // no point collecting content or rewriting this to render in a certain way that makes sense
    // for something currently impossible.
    return message.content
        || message.messageSnapshots?.[0]?.message.content
        || message.embeds?.find(embed => embed.type === "auto_moderation_message")?.rawDescription || "";
}

let tooltipTimeout: any;

export default definePlugin({
    name: "Translate",
    description: "Translate messages with Google Translate, DeepL or Kagi.",
    tags: ["Chat", "Utility"],
    authors: [Devs.Ven, Devs.AshtonMemer],
    settings,
    contextMenus: {
        "message": messageCtxPatch
    },

    renderMessageAccessory: props => <TranslationAccessory message={props.message} />,

    chatBarButton: {
        icon: TranslateIcon,
        render: TranslateChatBarIcon
    },

    messagePopoverButton: {
        icon: TranslateIcon,
        render(message: Message) {
            const content = getMessageContent(message);
            if (!content) return null;

            return {
                label: "Translate",
                icon: TranslateIcon,
                onClick: async () => {
                    const trans = await translate("received", content);
                    handleTranslate(message.id, trans);
                }
            };
        }
    },

    async onBeforeMessageSend(_, message) {
        if (!settings.store.autoTranslate) return;
        if (!message.content) return;

        setShouldShowTranslateEnabledTooltip?.(true);
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => setShouldShowTranslateEnabledTooltip?.(false), 2000);

        const trans = await translate("sent", message.content);
        message.content = trans.text;
    }
});
