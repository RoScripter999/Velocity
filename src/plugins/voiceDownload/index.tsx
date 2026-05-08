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

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Icons } from "@webpack/common";

export default definePlugin({
    name: "VoiceDownload",
    description: "Adds a download to voice messages. (Opens a new browser tab)",
    tags: ["Voice", "Media"],
    authors: [Devs.puv],
    patches: [
        {
            find: "#{intl::VOICE_MESSAGES_PLAYBACK_RATE_LABEL}",
            replacement: {
                match: /(?<=onVolumeHide:\i\}\))/,
                replace: ",$self.renderDownload(arguments[0].src)"
            }
        }
    ],

    renderDownload(src: string) {
        return (
            <a
                className="vc-voice-download"
                href={src}
                onClick={e => e.stopPropagation()}
                aria-label="Download voice message"
                {...IS_DISCORD_DESKTOP
                    ? { target: "_blank" } // open externally
                    : { download: "voice-message.ogg" } // download directly (not supported on discord desktop)
                }
            >
                <Icons.DownloadIcon />
            </a>
        );
    }
});
