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

import type { User } from "@velocity-types";

export enum QuoteFont {
    MPlusRounded = "M PLUS Rounded 1c",
    OpenSans = "Open Sans",
    MomoSignature = "Momo Signature",
    Lora = "Lora",
    Merriweather = "Merriweather"
}

export enum QuoteFontWeight {
    Light = "300",
    Regular = "400",
    Semibold = "600",
    Bold = "700"
}

export enum QuoteAlignment {
    Left = "left",
    Center = "center",
    Right = "right"
}

export enum QuoteTextColor {
    White = "#ffffff",
    OffWhite = "#e0e0e0",
    Black = "#111111"
}

export enum QuoteAuthorFormat {
    Both = "both",
    NameOnly = "name",
    UsernameOnly = "username"
}

export enum QuoteAvatarSize {
    Full = "full",
    Large = "large"
}

export interface QuoteSourceMeta {
    author: User;
    avatarUrl: string;
    quote: string;
}

export interface QuoteRenderOptions {
    grayScale: boolean;
    quoteFont: QuoteFont;
    fontWeight: QuoteFontWeight;
    watermark: string;
    showWatermark: boolean;
    saveAsGif: boolean;
    alignment: QuoteAlignment;
    textColor: QuoteTextColor;
    showAvatar: boolean;
    avatarOnRight: boolean;
    avatarSize: QuoteAvatarSize;
    authorFormat: QuoteAuthorFormat;
    showQuotationMarks: boolean;
}

export type QuoteImageOptions = QuoteSourceMeta & QuoteRenderOptions;

export interface CanvasConfig {
    width: number;
    height: number;
    quoteAreaWidth: number;
    quoteAreaX: number;
    maxContentHeight: number;
}

export interface FontSizeCalculation {
    fontSize: number;
    lineHeight: number;
    authorFontSize: number;
    usernameFontSize: number;
    lines: string[];
    totalHeight: number;
}

export const CANVAS_CONFIG: CanvasConfig = {
    width: 1200,
    height: 600,
    quoteAreaWidth: 520,
    quoteAreaX: 640,
    maxContentHeight: 480
};

export const FONT_SIZES = {
    initial: 42,
    minimum: 18,
    decrement: 2,
    lineHeightMultiplier: 1.25,
    authorMultiplier: 0.60,
    usernameMultiplier: 0.45,
    authorMinimum: 22,
    usernameMinimum: 18,
    watermark: 18
};

export const SPACING = {
    authorTop: 60,
    username: 10,
    gradientWidth: 400,
    watermarkPadding: 20,
    noAvatarQuoteWidth: 900,
    textPadding: 40
};

export const AVATAR_COLUMN_WIDTHS: Record<QuoteAvatarSize, number> = {
    [QuoteAvatarSize.Full]: 600,
    [QuoteAvatarSize.Large]: 700
};
