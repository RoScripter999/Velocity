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

import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { getIntlMessage } from "@utils/discord";
import { classes } from "@utils/misc";
import definePlugin, { type PluginNative } from "@utils/types";
import { findComponentByCodeLazy, findCssClassesLazy } from "@webpack";
import { Clickable, Icons } from "@webpack/common";

const Native = VelocityNative.pluginHelpers.DirectFileDownload as PluginNative<typeof import("./native")>;

const AttachmentButton = findComponentByCodeLazy("__unsupportedReactNodeAsText", "caretConfig");
const ButtonWrapperClasses = findCssClassesLazy("hoverButton", "hoverButtonGroup");

function saveAttachment(downloadURL: string) {
    Native.saveAttachment(downloadURL).catch(() => VelocityNative.native.openExternal(downloadURL));
}

export default definePlugin({
    name: "DirectFileDownload",
    description: "Directly download files from Discord instead of opening them in the browser",
    authors: [Devs.RoScripter999],

    patches: [
        {
            find: '},"download"));',
            replacement: {
                match: /(\i&&!\i&&\i\.push\()\(0(.*?)},"download"\)\);/,
                replace: "$1$self.renderDownloadButton(arguments[0]));"
            }
        },
        {
            find: '"plaintext-preview-overflow-menu"',
            replacement: {
                match: /(,action:\(\)=>{)\i\.current\?\.click\(\),\i\(\)}/,
                replace: "$1$self.saveAttachment(arguments[0].url)}"
            }
        }
    ],

    saveAttachment,

    renderDownloadButton: ErrorBoundary.wrap(({ downloadURL }) => (
        <AttachmentButton text={getIntlMessage("DOWNLOAD")}>
            <Clickable
                className={classes(ButtonWrapperClasses.hoverButton)}
                onClick={() => saveAttachment(downloadURL)}
            >
                <Icons.DownloadIcon size="refresh_sm" />
            </Clickable>
        </AttachmentButton>
    ), { noop: true })
});
