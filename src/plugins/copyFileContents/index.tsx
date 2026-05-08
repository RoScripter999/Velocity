/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 Velocitcs and contributors
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

import "./style.css";

import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { copyWithToast } from "@utils/discord";
import definePlugin from "@utils/types";
import { Icons, Tooltip, useState } from "@webpack/common";

export default definePlugin({
    name: "CopyFileContents",
    description: "Adds a button to text file attachments to copy their contents",
    tags: ["Utility"],
    authors: [Devs.Obsidian, Devs.Nuckyz],
    patches: [
        {
            find: "#{intl::PREVIEW_BYTES_LEFT}",
            replacement: [
                // Inline preview
                {
                    match: /fileContents:(\i),bytesLeft:(\i)\}\):null,/,
                    replace: "$&$self.addCopyButton({fileContents:$1,bytesLeft:$2}),"
                },
                // Modal
                {
                    match: /align:"\i"\}\),(?=\(0,\i\.jsx\)\(\i,\{wordWrap:\i,setWordWrap:\i)/,
                    replace: "$&$self.addCopyButton(arguments[0]),"
                }
            ]
        }
    ],

    addCopyButton: ErrorBoundary.wrap(({ fileContents, bytesLeft }: { fileContents: string, bytesLeft: number; }) => {
        const [recentlyCopied, setRecentlyCopied] = useState(false);

        return (
            <Tooltip text={recentlyCopied ? "Copied!" : bytesLeft > 0 ? "File too large to copy" : "Copy File Contents"}>
                {tooltipProps => (
                    <div
                        {...tooltipProps}
                        className="vc-cfc-button"
                        role="button"
                        onClick={() => {
                            if (!recentlyCopied && bytesLeft <= 0) {
                                copyWithToast(fileContents);
                                setRecentlyCopied(true);
                                setTimeout(() => setRecentlyCopied(false), 2000);
                            }
                        }}
                    >
                        {recentlyCopied ? <Icons.CheckmarkLargeIcon /> : bytesLeft > 0 ? <Icons.DenyIcon color="var(--channel-icon)" /> : <Icons.CopyIcon />}
                    </div>
                )}
            </Tooltip>
        );
    }, { noop: true })
});
