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

import ErrorBoundary from "@components/ErrorBoundary";
import { Link } from "@components/Link";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { GUILD_ID, INVITE_KEY, RAW_SKU_ID } from "@plugins/decor/lib/constants";
import { useCurrentUserDecorationsStore } from "@plugins/decor/lib/stores/CurrentUserDecorationsStore";
import { cl, DecorationModalClasses, requireAvatarDecorationModal, requireCreateStickerModal } from "@plugins/decor/ui";
import { AvatarDecorationModalPreview } from "@plugins/decor/ui/components";
import { openInviteModal } from "@utils/discord";
import type { ModalPropsRender } from "@velocity-types";
import { Buttons, closeAllModals, FilePicker, FluxDispatcher, Forms, GuildStore, HelpMessage, Modal, NavigationRouter, openModal, TextInput, useEffect, useMemo, UserStore, useState } from "@webpack/common";

function useObjectURL(object: Blob | MediaSource | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!object) return;

        const objectUrl = URL.createObjectURL(object);
        setUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
            setUrl(null);
        };
    }, [object]);

    return url;
}

function CreateDecorationModal(props: ModalPropsRender) {
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (error) setError(null);
    }, [file]);

    const { create: createDecoration } = useCurrentUserDecorationsStore();

    const fileUrl = useObjectURL(file);

    const decoration = useMemo(() => fileUrl ? { asset: fileUrl, skuId: RAW_SKU_ID } : null, [fileUrl]);

    return <Modal
        {...props}
        size="lg"
        title="Create Decoration"
        actions={[
            {
                text: "Cancel",
                variant: "secondary",
                onClick: props.onClose
            },
            {
                text: "Submit for Review",
                variant: "primary",
                onClick: () => {
                    setSubmitting(true);
                    createDecoration({ alt: name, file: file! })
                        .then(props.onClose).catch(e => { setSubmitting(false); setError(e); });
                },
                disabled: !file || !name || submitting
            }
        ]}
    >
        <div className={cl("create-decoration-modal-content", DecorationModalClasses.modal)}>
            <ErrorBoundary>
                <HelpMessage messageType="warn">
                    Make sure your decoration does not violate <Link
                        href="https://github.com/decor-discord/.github/blob/main/GUIDELINES.md"
                    >
                        the guidelines
                    </Link> before submitting it.
                </HelpMessage>
                <div className={cl("create-decoration-modal-form-preview-container")}>
                    <div className={cl("create-decoration-modal-form")}>
                        {error !== null && <Paragraph color="text-feedback-critical" variant="text-xs/normal">{error.message}</Paragraph>}
                        <section>
                            <Forms.FormTitle tag="h5">File</Forms.FormTitle>
                            <div style={{ position: "relative" }}>
                                <Buttons.Button text={file?.name ? `File: ${file.name}` : "Browse"} />
                                <FilePicker
                                    filters={[{ name: "Decoration file", extensions: ["png", "apng"] }]}
                                    onChange={e => {
                                        const f = e.target.files?.[0];
                                        if (f) setFile(f);
                                    }}
                                />
                            </div>
                            <Paragraph className={Margins.top8}>
                                File should be APNG or PNG.
                            </Paragraph>
                        </section>
                        <section>
                            <TextInput
                                label="Name"
                                placeholder="Companion Cube"
                                value={name}
                                onChange={setName}
                            />
                            <Paragraph className={Margins.top8}>
                                This name will be used when referring to this decoration.
                            </Paragraph>
                        </section>
                    </div>
                    <div>
                        <AvatarDecorationModalPreview
                            avatarDecoration={decoration}
                            user={UserStore.getCurrentUser()}
                        />
                    </div>
                </div>
                <HelpMessage messageType="info" className={Margins.bottom8}>
                    To receive updates on your decoration's review, join <Link
                        href={`https://discord.gg/${INVITE_KEY}`}
                        onClick={async e => {
                            e.preventDefault();
                            if (!GuildStore.getGuild(GUILD_ID)) {
                                const inviteAccepted = await openInviteModal(INVITE_KEY);
                                if (inviteAccepted) {
                                    closeAllModals();
                                    FluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                                }
                            } else {
                                closeAllModals();
                                FluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                                NavigationRouter.transitionToGuild(GUILD_ID);
                            }
                        }}
                    >
                        Decor's Discord server
                    </Link> and allow direct messages.
                </HelpMessage>
            </ErrorBoundary>
        </div>
    </Modal>;
}

export const openCreateDecorationModal = () =>
    Promise.all([requireAvatarDecorationModal(), requireCreateStickerModal()])
        .then(() => openModal(props => <CreateDecorationModal {...props} />));
