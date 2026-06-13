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
import { generateId, sendBotMessage } from "@api/Commands";
import { Devs } from "@utils/constants";
import definePlugin, { StartAt } from "@utils/types";
import type { MessageAttachment } from "@velocity-types";
import { DraftStore, DraftType, Icons, UploadStore, UserStore, useStateFromStores } from "@webpack/common";

const getDraft = (channelId: string) =>
    DraftStore.getDraft(channelId, DraftType.ChannelMessage);

const getImageBox = (url: string): Promise<{ width: number, height: number; } | null> =>
    new Promise(res => {
        const img = new Image();
        img.onload = () => res({ width: img.width, height: img.height });
        img.onerror = () => res(null);
        img.src = url;
    });

const getAttachments = async (channelId: string) =>
    await Promise.all(
        UploadStore.getFiles(channelId).map(async upload => {
            const { isImage, filename, spoiler, file } = upload;

            if (!file) return null;

            const url = URL.createObjectURL(file);

            const attachment: MessageAttachment = {
                id: generateId(),
                filename: spoiler ? "SPOILER_" + filename : filename,
                content_type: undefined,
                size: upload.size ?? 0,
                spoiler: !!spoiler,
                url: url + "#",
                proxy_url: url + "#"
            };


            if (isImage) {
                const box = await getImageBox(url);
                if (box) {
                    attachment.width = box.width;
                    attachment.height = box.height;
                }
            }

            return attachment;
        })
    ).then(list => list.filter(Boolean) as MessageAttachment[]);

const PreviewButton: ChatBarButtonFactory = ({ isMainChat, isEmpty, type: { attachments }, channel }) => {
    const channelId = channel.id;
    const draft = useStateFromStores([DraftStore], () => getDraft(channelId));

    if (!isMainChat) return null;

    const uploads = UploadStore.getFiles(channelId);
    const hasAttachments = attachments && uploads.length > 0;
    const hasContent = !isEmpty && draft?.length > 0;

    if (!hasContent && !hasAttachments) return null;

    return (
        <ChatBarButton
            tooltip="Preview Message"
            onClick={async () =>
                sendBotMessage(channelId, {
                    content: getDraft(channelId),
                    author: UserStore.getCurrentUser(),
                    attachments: hasAttachments ? await getAttachments(channelId) : undefined
                })}
            buttonProps={{
                style: {
                    translate: "0 2px"
                }
            }}
        >
            <Icons.EyeIcon size="refresh_sm" color="currentColor" />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "PreviewMessage",
    description: "Lets you preview your message before sending it.",
    tags: ["Chat", "Utility"],
    authors: [Devs.Aria],
    startAt: StartAt.Init,

    chatBarButton: {
        icon: () => <Icons.EyeIcon size="refresh_sm" color="currentColor" />,
        required: true,
        render: PreviewButton
    }
});

