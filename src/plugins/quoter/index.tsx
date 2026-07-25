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

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Icons, Menu, openModal } from "@webpack/common";

import { QuoteModal } from "./components/QuoteModal";
import managedStyle from "./styles.css?managed";
import { QuoteAlignment, QuoteAuthorFormat, QuoteAvatarSize, QuoteFont, QuoteFontWeight, QuoteTextColor } from "./types";

export const settings = definePluginSettings({
    quoteFont: {
        type: OptionType.SELECT,
        description: "Font for the quote text (author name always uses M PLUS Rounded 1c).",
        options: [
            { label: "M PLUS Rounded 1c", value: QuoteFont.MPlusRounded, default: true },
            { label: "Open Sans", value: QuoteFont.OpenSans },
            { label: "Momo Signature", value: QuoteFont.MomoSignature },
            { label: "Lora", value: QuoteFont.Lora },
            { label: "Merriweather", value: QuoteFont.Merriweather }
        ]
    },
    fontWeight: {
        type: OptionType.SELECT,
        description: "Weight of the quote text.",
        options: [
            { label: "Light", value: QuoteFontWeight.Light, default: true },
            { label: "Regular", value: QuoteFontWeight.Regular },
            { label: "Semibold", value: QuoteFontWeight.Semibold },
            { label: "Bold", value: QuoteFontWeight.Bold }
        ]
    },
    alignment: {
        type: OptionType.SELECT,
        description: "Text alignment for the quote.",
        options: [
            { label: "Left", value: QuoteAlignment.Left },
            { label: "Center", value: QuoteAlignment.Center, default: true },
            { label: "Right", value: QuoteAlignment.Right }
        ]
    },
    textColor: {
        type: OptionType.SELECT,
        description: "Color of the quote text.",
        options: [
            { label: "White", value: QuoteTextColor.White, default: true },
            { label: "Off White", value: QuoteTextColor.OffWhite },
            { label: "Black", value: QuoteTextColor.Black }
        ]
    },
    authorFormat: {
        type: OptionType.SELECT,
        description: "Format used to display the author's name.",
        options: [
            { label: "Display name + username", value: QuoteAuthorFormat.Both, default: true },
            { label: "Display name only", value: QuoteAuthorFormat.NameOnly },
            { label: "Username only", value: QuoteAuthorFormat.UsernameOnly }
        ]
    },
    watermark: {
        type: OptionType.STRING,
        description: "Custom watermark text (max 32 characters).",
        default: "Made with Velocity"
    },
    grayscale: {
        type: OptionType.BOOLEAN,
        description: "Enable grayscale by default.",
        default: true,
        hidden: true
    },
    showAvatar: {
        type: OptionType.BOOLEAN,
        description: "Show the author's avatar.",
        default: true,
        hidden: true
    },
    avatarOnRight: {
        type: OptionType.BOOLEAN,
        description: "Place the avatar on the right side.",
        default: false,
        hidden: true
    },
    avatarSize: {
        type: OptionType.SELECT,
        description: "How much of the canvas the avatar occupies.",
        hidden: true,
        options: [
            { label: "Full", value: QuoteAvatarSize.Full, default: true },
            { label: "Large", value: QuoteAvatarSize.Large }
        ]
    },
    showQuotationMarks: {
        type: OptionType.BOOLEAN,
        description: "Add decorative quotation marks around the quote text.",
        default: false,
        hidden: true
    },
    showWatermark: {
        type: OptionType.BOOLEAN,
        description: "Show watermark by default.",
        default: false,
        hidden: true
    },
    saveAsGif: {
        type: OptionType.BOOLEAN,
        description: "Save as GIF by default.",
        default: false,
        hidden: true
    }
});

export default definePlugin({
    name: "Quoter",
    description: "Adds the ability to create an inspirational quote image from a message.",
    authors: [Devs.RoScripter999],
    settings,
    managedStyle,

    contextMenus: {
        "message": {
            required: true,
            render: (children, { message }) => {
                if (!message.content) return;
                children.push(
                    <Menu.MenuItem
                        id="vc-quote"
                        label="Quote"
                        icon={Icons.QuoteIcon}
                        leadingAccessory={{
                            type: "icon",
                            icon: Icons.QuoteIcon
                        }}
                        action={() => openModal(props => <QuoteModal message={message} {...props} />)}
                    />
                );
            }
        }
    }
});
