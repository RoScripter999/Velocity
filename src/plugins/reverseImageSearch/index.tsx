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

import { findGroupChildrenByChildId, type NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import type { Message } from "@velocity-types";
import { Icons, Menu } from "@webpack/common";

const Engines = {
    Google: "https://lens.google.com/uploadbyurl?url=",
    Yandex: "https://yandex.com/images/search?rpt=imageview&url=",
    SauceNAO: "https://saucenao.com/search.php?url=",
    IQDB: "https://iqdb.org/?url=",
    Bing: "https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:",
    TinEye: "https://www.tineye.com/search?url=",
    ImgOps: "https://imgops.com/start?url="
} as const;

function search(src: string, engine: string) {
    open(engine + encodeURIComponent(src), "_blank");
}

function makeSearchItem(src: string, id = "search-image", label = "Search Image", showIcon = false) {
    return (
        <Menu.MenuItem
            label={label}
            key={id}
            id={id}
            leadingAccessory={showIcon ? { type: "image", src } : { type: "icon", icon: Icons.ImagesIcon }}
        >
            {Object.keys(Engines).map(engine => {
                const key = `${id}-${engine}`;
                const iconSrc = `https://icons.duckduckgo.com/ip3/${new URL(Engines[engine]).hostname}.ico`;

                return (
                    <Menu.MenuItem
                        key={key}
                        id={key}
                        label={engine}
                        icon={() => <img src={iconSrc} aria-hidden />}
                        leadingAccessory={{ type: "image", src: iconSrc }}
                        action={() => search(src, Engines[engine])}
                    />
                );
            })}
            <Menu.MenuItem
                key={`${id}-all`}
                id={`${id}-all`}
                leadingAccessory={{ type: "icon", icon: Icons.WindowLaunchIcon }}
                icon={Icons.WindowLaunchIcon}
                label="All"
                action={() => Object.values(Engines).forEach(e => search(src, e))}
            />
        </Menu.MenuItem>
    );
}

function getMessageImages(message: Message) {
    const attachmentImages = message.attachments
        .filter(a => a.content_type?.startsWith("image/"))
        .map(a => a.url);

    const embedImages = message.embeds
        .filter((e): e is typeof e & { url: string; } => e.type === "image" && e.url != null);

    return [...attachmentImages, ...embedImages.map(e => e.url)];
}

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, props) => {
    const images = getMessageImages(props.message);
    if (!images.length) return;

    const group = findGroupChildrenByChildId("copy-link", children) ?? children;

    if (images.length === 1) {
        group.push(makeSearchItem(images[0]));
        return;
    }

    group.push(
        <Menu.MenuItem leadingAccessory={{ type: "icon", icon: Icons.ImagesIcon }} label="Search Image" key="search-image" id="search-image">
            {images.map((src, i) => makeSearchItem(src, `search-image-${i + 1}`, `Image ${i + 1}`, true))}
        </Menu.MenuItem>
    );
};

const imageContextMenuPatch: NavContextMenuPatchCallback = (children, props) => {
    if (!props?.src) return;

    const group = findGroupChildrenByChildId("copy-native-link", children) ?? children;
    group.push(makeSearchItem(props.src));
};

export default definePlugin({
    name: "ReverseImageSearch",
    description: "Adds ImageSearch to image context menus",
    tags: ["Media", "Utility"],
    authors: [Devs.Ven, Devs.Nuckyz],
    searchTerms: ["ImageUtilities"],

    patches: [
        {
            find: "#{intl::MESSAGE_ACTIONS_MENU_LABEL}),shouldHideMediaOptions:",
            replacement: {
                match: /favoriteableType:\i,(?<=(\i)\.getAttribute\("data-type"\).+?)/,
                replace: (m, target) => `${m}reverseImageSearchType:${target}.getAttribute("data-role"),`
            }
        }
    ],
    contextMenus: {
        "message": { required: true, render: messageContextMenuPatch },
        "image-context": { required: true, render: imageContextMenuPatch }
    }
});
