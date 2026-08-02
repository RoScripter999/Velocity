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

import { Switch } from "@components/Switch";
import { classNameFactory } from "@utils/css";
import { getCurrentChannel } from "@utils/discord";
import { saveFile } from "@utils/web";
import type { Message, ModalPropsRender } from "@velocity-types";
import { Forms, IconUtils, LoadingIndicator, Modal, PermissionsBits, PermissionStore, Select, TextInput, UploadHandler, useEffect, useRef, useState } from "@webpack/common";

import { settings } from "..";
import { QuoteAvatarSize, QuoteFontWeight } from "../types";
import { createQuoteImage, generateFileNamePreview, getFileExtension, getMimeType } from "../utils";

const cl = classNameFactory("vc-quoter-");

export function QuoteModal({ message, ...props }: ModalPropsRender & { message: Message; }) {
    const {
        grayscale, showWatermark, saveAsGif, watermark, quoteFont,
        fontWeight, alignment, textColor, showAvatar, avatarOnRight,
        avatarSize, authorFormat, showQuotationMarks
    } = settings.use([
        "grayscale", "showWatermark", "saveAsGif", "watermark", "quoteFont",
        "fontWeight", "alignment", "textColor", "showAvatar", "avatarOnRight",
        "avatarSize", "authorFormat", "showQuotationMarks"
    ]);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const blobRef = useRef<Blob | null>(null);
    const prevUrlRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        createQuoteImage({
            avatarUrl: IconUtils.getUserAvatarURL(message.author, true, 512),
            quote: message.content,
            grayScale: grayscale,
            author: message.author,
            watermark,
            showWatermark,
            saveAsGif,
            quoteFont,
            fontWeight,
            alignment,
            textColor,
            showAvatar,
            avatarOnRight,
            avatarSize,
            authorFormat,
            showQuotationMarks
        }).then(blob => {
            if (cancelled) return;
            blobRef.current = blob;
            const url = URL.createObjectURL(blob);
            if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
            prevUrlRef.current = url;
            setPreviewUrl(url);
        });

        return () => { cancelled = true; };
    }, [grayscale, showWatermark, saveAsGif, watermark, quoteFont, fontWeight, alignment, textColor, showAvatar, avatarOnRight, avatarSize, authorFormat, showQuotationMarks]);

    useEffect(() => () => {
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    }, []);

    function buildFile() {
        const ext = getFileExtension(saveAsGif);
        const name = `${generateFileNamePreview(message.content)} - ${message.author.username}.${ext}`;
        return new File([blobRef.current!], name, { type: getMimeType(saveAsGif) });
    }

    const channel = getCurrentChannel();
    const canSend = !!channel && (channel.isPrivate() || PermissionStore.can(PermissionsBits.ATTACH_FILES, channel));

    return (
        <Modal {...props} title="Quote Message" size="lg" actions={[
            {
                text: "Export",
                onClick: () => { if (blobRef.current) saveFile(buildFile()); }
            },
            {
                text: "Send",
                onClick: () => {
                    if (!blobRef.current || !canSend) return;
                    UploadHandler.promptToUpload([buildFile()], channel, 0);
                    props.onClose();
                },
                disabled: !canSend
            }
        ]}>
            {previewUrl
                ? <img src={previewUrl} alt="Quote preview" className={cl("preview")} />
                : <div className={cl("loading")}>
                    <LoadingIndicator type="wanderingCubes" />
                </div>
            }

            <div className={cl("controls")}>
                <Forms.FormSection tag="h2" title="Image">
                    <Switch label="Grayscale" checked={grayscale} onChange={v => settings.store.grayscale = v} showBorder />
                    <Switch
                        label="Bold text"
                        description="Toggles between bold and light weight (use plugin settings for more options)"
                        checked={fontWeight === QuoteFontWeight.Bold}
                        showBorder
                        onChange={v => settings.store.fontWeight = v ? QuoteFontWeight.Bold : QuoteFontWeight.Light}
                    />
                    <Switch
                        label="Decorative quotation marks"
                        checked={showQuotationMarks}
                        showBorder
                        onChange={v => settings.store.showQuotationMarks = v}
                    />
                </Forms.FormSection>

                <Forms.FormSection tag="h2" title="Avatar">
                    <Switch
                        label="Show avatar"
                        checked={showAvatar}
                        showBorder={!showAvatar}
                        onChange={v => settings.store.showAvatar = v}
                    />
                    {showAvatar && (<>
                        <Switch
                            label="Avatar on right"
                            checked={avatarOnRight}
                            onChange={v => settings.store.avatarOnRight = v}
                        />
                        <div style={{ marginBottom: 20 }}>
                            <Select
                                label="Size"
                                description="Size of the avatar horizontally"
                                layout="horizontal"
                                options={[
                                    { label: "Full", value: QuoteAvatarSize.Full },
                                    { label: "Large", value: QuoteAvatarSize.Large }
                                ]}
                                onSelectionChange={v => settings.store.avatarSize = v}
                                fullWidth
                                formatOption={option => ({
                                    ...option,
                                    id: option.value
                                })}
                                value={avatarSize}
                            />
                        </div>
                    </>)}
                </Forms.FormSection>

                <Forms.FormSection tag="h2" title="Export">
                    <Switch
                        label="Save as GIF"
                        description="Saves and sends as GIF instead of PNG"
                        checked={saveAsGif}
                        onChange={v => settings.store.saveAsGif = v}
                        showBorder={!showWatermark}
                    />
                    <Switch
                        label="Show watermark"
                        checked={showWatermark}
                        showBorder={showWatermark}
                        onChange={v => settings.store.showWatermark = v}
                    />
                    {showWatermark && (
                        <TextInput
                            value={watermark}
                            onChange={v => settings.store.watermark = v}
                            placeholder="Watermark text (max 32 characters)"
                            maxLength={32}
                            showCharacterCount
                        />
                    )}
                </Forms.FormSection>
            </div>
        </Modal>
    );
}
