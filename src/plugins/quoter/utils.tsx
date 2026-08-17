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

import type { CustomEmoji, User } from "@velocity-types";
import { IconUtils, UserStore } from "@webpack/common";
import { applyPalette, GIFEncoder, quantize } from "gifenc";

import { AVATAR_COLUMN_WIDTHS, CANVAS_CONFIG, type CanvasConfig, FONT_SIZES, type FontSizeCalculation, QuoteAlignment, QuoteAuthorFormat, type QuoteAvatarSize, type QuoteFont, type QuoteFontWeight, type QuoteImageOptions, type QuoteTextColor, SPACING } from "./types";

const CUSTOM_EMOJI_REGEX = /<a?:(\w+):(\d+)>/g;
const CUSTOM_EMOJI_PLACEHOLDER = "￼";
const CUSTOM_EMOJI_SIZE_MULTIPLIER = 1.15;
const CUSTOM_EMOJI_BASELINE_OFFSET = 0.85;

interface DynamicLayout {
    avatarX: number;
    avatarColumnWidth: number;
    quoteAreaX: number;
    quoteAreaWidth: number;
    maxContentHeight: number;
}

function computeLayout(showAvatar: boolean, avatarOnRight: boolean, avatarSize: QuoteAvatarSize): DynamicLayout {
    if (!showAvatar) {
        const quoteAreaWidth = SPACING.noAvatarQuoteWidth;
        return {
            avatarX: -1,
            avatarColumnWidth: 0,
            quoteAreaX: (CANVAS_CONFIG.width - quoteAreaWidth) / 2,
            quoteAreaWidth,
            maxContentHeight: CANVAS_CONFIG.maxContentHeight
        };
    }

    const columnWidth = AVATAR_COLUMN_WIDTHS[avatarSize];
    const remaining = CANVAS_CONFIG.width - columnWidth;
    const quoteAreaWidth = Math.max(300, remaining - SPACING.textPadding * 2);

    if (avatarOnRight) {
        return {
            avatarX: CANVAS_CONFIG.width - columnWidth,
            avatarColumnWidth: columnWidth,
            quoteAreaX: SPACING.textPadding,
            quoteAreaWidth,
            maxContentHeight: CANVAS_CONFIG.maxContentHeight
        };
    }
    return {
        avatarX: 0,
        avatarColumnWidth: columnWidth,
        quoteAreaX: columnWidth + SPACING.textPadding,
        quoteAreaWidth,
        maxContentHeight: CANVAS_CONFIG.maxContentHeight
    };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) return reject(new Error("Failed to create Blob"));
            resolve(blob);
        }, "image/png");
    });
}

async function fetchImageAsBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    return response.blob();
}

function fixUpQuote(quote: string): string {
    let result = quote;
    for (const match of result.match(/<@!?\d+>/g) ?? []) {
        const user = UserStore.getUser(match.replace(/[<@!>]/g, ""));
        if (user?.username) result = result.replace(match, `@${user.username}`);
    }
    return result;
}

async function canvasToGif(canvas: HTMLCanvasElement): Promise<Blob> {
    const gif = GIFEncoder();
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D rendering context");

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);

    gif.writeFrame(index, canvas.width, canvas.height, { transparent: false, palette });
    gif.finish();

    return new Blob([new Uint8Array(gif.bytesView())], { type: "image/gif" });
}

async function loadImage(blob: Blob): Promise<HTMLImageElement> {
    const image = new Image();
    const blobUrl = URL.createObjectURL(blob);

    try {
        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("Failed to load image"));
            image.src = blobUrl;
        });
        return image;
    } finally {
        URL.revokeObjectURL(blobUrl);
    }
}

function applyGrayscaleFilter(ctx: CanvasRenderingContext2D, config: CanvasConfig): void {
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, config.width, config.height);
    ctx.globalCompositeOperation = "source-over";
}

function drawGradientOverlay(ctx: CanvasRenderingContext2D, config: CanvasConfig, layout: DynamicLayout, avatarOnRight: boolean): void {
    const { avatarX, avatarColumnWidth } = layout;
    const gradW = Math.min(SPACING.gradientWidth, avatarColumnWidth);
    let gradient: CanvasGradient;

    if (avatarOnRight) {
        gradient = ctx.createLinearGradient(avatarX, 0, avatarX + gradW, 0);
        gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(avatarX, 0, gradW, config.height);
    } else {
        const startX = avatarX + avatarColumnWidth - gradW;
        gradient = ctx.createLinearGradient(startX, 0, startX + gradW, 0);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(startX, 0, gradW, config.height);
    }
}


function extractCustomEmojis(text: string): { text: string; emojis: CustomEmoji[]; } {
    const emojis: any[] = [];
    const cleanText = text.replace(CUSTOM_EMOJI_REGEX, (match, name: string, id: string) => {
        emojis.push({ id, name, animated: match.startsWith("<a:") });
        return CUSTOM_EMOJI_PLACEHOLDER;
    });

    return { text: cleanText, emojis };
}

async function loadCustomEmojiImage(emoji: CustomEmoji): Promise<HTMLImageElement | null> {
    const variants = emoji.animated ? [true, false] : [false];
    for (const animated of variants) {
        try {
            return await loadImage(await fetchImageAsBlob(IconUtils.getEmojiURL({ id: emoji.id, animated, size: 96 })));
        } catch {
            continue;
        }
    }
    return null;
}

async function loadCustomEmojiImages(emojis: CustomEmoji[]): Promise<Map<string, HTMLImageElement>> {
    if (!emojis.length) return new Map();

    const unique = new Map<string, CustomEmoji>();
    for (const emoji of emojis) {
        const key = `${emoji.id}:${emoji.animated ? "a" : "s"}`;
        if (!unique.has(key)) unique.set(key, emoji);
    }

    const result = new Map<string, HTMLImageElement>();
    await Promise.all(
        Array.from(unique.entries()).map(async ([key, emoji]) => {
            const image = await loadCustomEmojiImage(emoji);
            if (image) result.set(key, image);
        })
    );
    return result;
}

function measureTextWithCustomEmojis(ctx: CanvasRenderingContext2D, text: string, fontSize: number): number {
    const emojiSize = fontSize * CUSTOM_EMOJI_SIZE_MULTIPLIER;
    let width = 0;
    let start = 0;

    for (let i = 0; i < text.length; i++) {
        if (text[i] !== CUSTOM_EMOJI_PLACEHOLDER) continue;
        width += ctx.measureText(text.slice(start, i)).width;
        width += emojiSize;
        start = i + 1;
    }

    width += ctx.measureText(text.slice(start)).width;
    return width;
}

function calculateTextLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    fontSize: number,
    font: QuoteFont,
    fontWeight: QuoteFontWeight,
    maxWidth: number
): string[] {
    ctx.font = `${fontWeight} ${fontSize}px '${font}', sans-serif`;
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine: string[] = [];

    for (const word of words) {
        if (measureTextWithCustomEmojis(ctx, word, fontSize) > maxWidth) {
            if (currentLine.length) {
                lines.push(currentLine.join(" "));
                currentLine = [];
            }

            let chunk = "";
            for (const char of word) {
                const testChunk = chunk + char;
                if (measureTextWithCustomEmojis(ctx, testChunk, fontSize) > maxWidth) {
                    if (chunk) lines.push(chunk);
                    chunk = char;
                } else {
                    chunk = testChunk;
                }
            }
            if (chunk) lines.push(chunk);
        } else {
            const testLine = [...currentLine, word].join(" ");
            if (measureTextWithCustomEmojis(ctx, testLine, fontSize) > maxWidth && currentLine.length) {
                lines.push(currentLine.join(" "));
                currentLine = [word];
            } else {
                currentLine.push(word);
            }
        }
    }

    if (currentLine.length) lines.push(currentLine.join(" "));

    return lines;
}

function calculateOptimalFontSize(
    ctx: CanvasRenderingContext2D,
    quote: string,
    font: QuoteFont,
    fontWeight: QuoteFontWeight,
    layout: DynamicLayout
): FontSizeCalculation {
    let fontSize = FONT_SIZES.initial;

    while (fontSize >= FONT_SIZES.minimum) {
        const lines = calculateTextLines(ctx, quote, fontSize, font, fontWeight, layout.quoteAreaWidth);
        const lineHeight = fontSize * FONT_SIZES.lineHeightMultiplier;
        const authorFontSize = Math.max(FONT_SIZES.authorMinimum, fontSize * FONT_SIZES.authorMultiplier);
        const usernameFontSize = Math.max(FONT_SIZES.usernameMinimum, fontSize * FONT_SIZES.usernameMultiplier);
        const totalHeight = (lines.length * lineHeight) + SPACING.authorTop + authorFontSize + SPACING.username + usernameFontSize;

        if (totalHeight <= layout.maxContentHeight) {
            return { fontSize, lineHeight, authorFontSize, usernameFontSize, lines, totalHeight };
        }
        fontSize -= FONT_SIZES.decrement;
    }

    const lines = calculateTextLines(ctx, quote, FONT_SIZES.minimum, font, fontWeight, layout.quoteAreaWidth);
    const lineHeight = FONT_SIZES.minimum * FONT_SIZES.lineHeightMultiplier;
    const totalHeight = (lines.length * lineHeight) + SPACING.authorTop + FONT_SIZES.authorMinimum + SPACING.username + FONT_SIZES.usernameMinimum;

    return {
        fontSize: FONT_SIZES.minimum,
        lineHeight,
        authorFontSize: FONT_SIZES.authorMinimum,
        usernameFontSize: FONT_SIZES.usernameMinimum,
        lines,
        totalHeight
    };
}

function getLineXOffset(lineWidth: number, quoteAreaWidth: number, alignment: QuoteAlignment): number {
    if (alignment === QuoteAlignment.Left) return 0;
    if (alignment === QuoteAlignment.Right) return quoteAreaWidth - lineWidth;
    return (quoteAreaWidth - lineWidth) / 2;
}

function drawQuoteText(
    ctx: CanvasRenderingContext2D,
    calculation: FontSizeCalculation,
    font: QuoteFont,
    fontWeight: QuoteFontWeight,
    layout: DynamicLayout,
    emojis: CustomEmoji[],
    emojiImages: Map<string, HTMLImageElement>,
    alignment: QuoteAlignment,
    textColor: QuoteTextColor
): number {
    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${calculation.fontSize}px '${font}', sans-serif`;
    const emojiSize = calculation.fontSize * CUSTOM_EMOJI_SIZE_MULTIPLIER;

    let quoteY = (CANVAS_CONFIG.height - calculation.totalHeight) / 2;
    let emojiIndex = 0;

    for (const line of calculation.lines) {
        const lineWidth = measureTextWithCustomEmojis(ctx, line, calculation.fontSize);
        const xOffset = getLineXOffset(lineWidth, layout.quoteAreaWidth, alignment);
        let x = layout.quoteAreaX + xOffset;
        let segmentStart = 0;
        quoteY += calculation.lineHeight;

        for (let i = 0; i < line.length; i++) {
            if (line[i] !== CUSTOM_EMOJI_PLACEHOLDER) continue;

            const segment = line.slice(segmentStart, i);
            if (segment) {
                ctx.fillText(segment, x, quoteY);
                x += ctx.measureText(segment).width;
            }

            const emoji = emojis[emojiIndex++];
            if (emoji) {
                const key = `${emoji.id}:${emoji.animated ? "a" : "s"}`;
                const image = emojiImages.get(key);
                if (image) {
                    ctx.drawImage(image, x, quoteY - emojiSize * CUSTOM_EMOJI_BASELINE_OFFSET, emojiSize, emojiSize);
                } else {
                    ctx.fillText("□", x, quoteY);
                }
            }

            x += emojiSize;
            segmentStart = i + 1;
        }

        const tail = line.slice(segmentStart);
        if (tail) ctx.fillText(tail, x, quoteY);
    }

    return quoteY;
}

function drawAuthorInfo(
    ctx: CanvasRenderingContext2D,
    author: User,
    calculation: FontSizeCalculation,
    layout: DynamicLayout,
    startY: number,
    textColor: QuoteTextColor,
    authorFormat: QuoteAuthorFormat
): void {
    const displayName = author.globalName || author.username;
    const showName = authorFormat !== QuoteAuthorFormat.UsernameOnly;
    const showUsername = authorFormat !== QuoteAuthorFormat.NameOnly && author.globalName;

    const authorY = startY + SPACING.authorTop;

    if (showName) {
        ctx.font = `italic 300 ${calculation.authorFontSize}px 'M PLUS Rounded 1c', sans-serif`;
        ctx.fillStyle = textColor;
        const authorText = `- ${displayName}`;
        const authorX = layout.quoteAreaX + (layout.quoteAreaWidth - ctx.measureText(authorText).width) / 2;
        ctx.fillText(authorText, authorX, authorY);

        if (showUsername) {
            ctx.font = `300 ${calculation.usernameFontSize}px 'M PLUS Rounded 1c', sans-serif`;
            ctx.fillStyle = "#888";
            const usernameText = `@${author.username}`;
            const usernameX = layout.quoteAreaX + (layout.quoteAreaWidth - ctx.measureText(usernameText).width) / 2;
            ctx.fillText(usernameText, usernameX, authorY + SPACING.username + calculation.usernameFontSize);
        }
    } else {
        ctx.font = `italic 300 ${calculation.authorFontSize}px 'M PLUS Rounded 1c', sans-serif`;
        ctx.fillStyle = textColor;
        const usernameText = `- @${author.username}`;
        const usernameX = layout.quoteAreaX + (layout.quoteAreaWidth - ctx.measureText(usernameText).width) / 2;
        ctx.fillText(usernameText, usernameX, authorY);
    }
}

function drawWatermark(ctx: CanvasRenderingContext2D, watermark: string, config: CanvasConfig, avatarOnRight: boolean): void {
    ctx.fillStyle = "#888";
    ctx.font = `300 ${FONT_SIZES.watermark}px 'M PLUS Rounded 1c', sans-serif`;
    const text = watermark.slice(0, 32);
    const x = avatarOnRight
        ? SPACING.watermarkPadding
        : config.width - ctx.measureText(text).width - SPACING.watermarkPadding;
    ctx.fillText(text, x, config.height - SPACING.watermarkPadding);
}

export async function createQuoteImage(options: QuoteImageOptions): Promise<Blob> {
    const {
        avatarUrl, quote: rawQuote, grayScale, author,
        watermark, showWatermark, saveAsGif,
        quoteFont, fontWeight, alignment, textColor,
        showAvatar, avatarOnRight, avatarSize,
        authorFormat, showQuotationMarks
    } = options;

    const quote = showQuotationMarks
        ? `“${fixUpQuote(rawQuote)}”`
        : fixUpQuote(rawQuote);

    const { text: quoteText, emojis } = extractCustomEmojis(quote);
    const emojiImages = await loadCustomEmojiImages(emojis);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D rendering context");

    canvas.width = CANVAS_CONFIG.width;
    canvas.height = CANVAS_CONFIG.height;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);

    const layout = computeLayout(showAvatar, avatarOnRight, avatarSize);

    if (showAvatar) {
        const avatar = await loadImage(await fetchImageAsBlob(avatarUrl));
        ctx.drawImage(avatar, layout.avatarX, 0, layout.avatarColumnWidth, CANVAS_CONFIG.height);
        if (grayScale) applyGrayscaleFilter(ctx, CANVAS_CONFIG);
        drawGradientOverlay(ctx, CANVAS_CONFIG, layout, avatarOnRight);
    }

    const calculation = calculateOptimalFontSize(ctx, quoteText, quoteFont, fontWeight, layout);
    const quoteEndY = drawQuoteText(ctx, calculation, quoteFont, fontWeight, layout, emojis, emojiImages, alignment, textColor);
    drawAuthorInfo(ctx, author, calculation, layout, quoteEndY, textColor, authorFormat);

    if (showWatermark && watermark) drawWatermark(ctx, watermark, CANVAS_CONFIG, avatarOnRight);

    return saveAsGif ? canvasToGif(canvas) : canvasToBlob(canvas);
}

export function generateFileNamePreview(message: string): string {
    return message.split(" ").slice(0, 6).join(" ").slice(0, 10);
}

export function getFileExtension(saveAsGif: boolean): string {
    return saveAsGif ? "gif" : "png";
}

export function getMimeType(saveAsGif: boolean): string {
    return saveAsGif ? "image/gif" : "image/png";
}
