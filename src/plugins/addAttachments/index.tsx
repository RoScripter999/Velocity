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

import { Devs } from "@utils/constants";
import { getCurrentChannel } from "@utils/discord";
import definePlugin from "@utils/types";
import { MessageFlags } from "@velocity-types/enums";
import { findLazy } from "@webpack";
import { Constants, Icons, PermissionsBits, PermissionStore, RestAPI, showToast, Toasts, UserStore } from "@webpack/common";

const uniqueIdProp = findLazy(m => typeof m.uniqueId === "function");

const addAttachments = async (channelId: string, messageId: string, files: FileList, attachments: any[]) => {
    showToast("Uploading, this can take a while...", Toasts.Type.CLOCK);

    const fileArray = Array.from(files).map(file => ({
        filename: file.name,
        file_size: file.size,
        id: uniqueIdProp.uniqueId(),
        is_clip: false
    }));

    const attachmentsReq = (await RestAPI.post({
        url: Constants.Endpoints.MESSAGE_CREATE_ATTACHMENT_UPLOAD(channelId),
        body: { files: fileArray }
    })).body.attachments as { id: string, upload_url: string, upload_filename: string; }[];

    const uploadPromises = attachmentsReq.map((uploadedFile, index) =>
        fetch(uploadedFile.upload_url, {
            method: "PUT",
            body: files[index]
        }).then(() => ({
            id: uploadedFile.id,
            uploaded_filename: uploadedFile.upload_filename,
            filename: files[index].name
        }))
    );

    const newAttachments = await Promise.all(uploadPromises);

    await RestAPI.patch({
        url: Constants.Endpoints.MESSAGE(channelId, messageId),
        body: {
            attachments: [
                ...attachments,
                ...newAttachments
            ]
        }
    });

    showToast("Attachments added successfully!", Toasts.Type.SUCCESS);
};

export default definePlugin({
    name: "AddAttachments",
    description: "Allows you to add attachments to a pre-existing message of yours",
    authors: [Devs.RoScripter999],

    messagePopoverButton: {
        required: true,
        icon: () => <Icons.CirclePlusIcon size="refresh_sm" />,
        render(msg) {
            if (UserStore.getCurrentUser().id !== msg.author.id || msg.deleted || msg.attachments.length === 10) return null;

            const currChannel = getCurrentChannel();
            if (currChannel?.guild_id && !PermissionStore.can(PermissionsBits.SEND_MESSAGES, currChannel)) return null;

            if (![0, 19].includes(msg.type) || msg.hasFlag(MessageFlags.IS_VOICE_MESSAGE)) return null;

            return {
                icon: Icons.CirclePlusIcon,
                label: "Left click to add, Right click to remove",
                onClick: async () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = "*/*";

                    input.onchange = async (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files?.length) {
                            await addAttachments(msg.channel_id, msg.id, target.files, msg.attachments);
                        }
                    };

                    input.click();
                },
                onContextMenu: async (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!msg.attachments.length) return null;

                    await RestAPI.patch({
                        url: Constants.Endpoints.MESSAGE(msg.channel_id, msg.id),
                        body: {
                            attachments: msg.attachments.slice(0, -1)
                        }
                    });

                    showToast("Attachment removed!", Toasts.Type.SUCCESS);
                }
            };
        }
    }
});
