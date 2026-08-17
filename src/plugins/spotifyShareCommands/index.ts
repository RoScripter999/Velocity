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

import { ApplicationCommandInputType, OptionalMessageOption, type VelocityCommand } from "@api/Commands";
import { Devs } from "@utils/constants";
import { sendMessage } from "@utils/discord";
import definePlugin from "@utils/types";
import { FluxDispatcher, MessageActions, PendingReplyStore, SpotifyStore } from "@webpack/common";

function makeCommand(name: string, formatUrl: (track: ReturnType<typeof SpotifyStore.getTrack>) => string | undefined): VelocityCommand {
    return {
        name,
        description: `Share your current Spotify ${name} in chat`,
        inputType: ApplicationCommandInputType.BUILT_IN,
        options: [OptionalMessageOption],
        execute(interaction, ctx) {
            const track = SpotifyStore.getTrack();
            if (!track) {
                return interaction.reply({
                    content: "You're not listening to any music."
                });
            }

            // local tracks have an id of null
            if (track.id == null) {
                return interaction.reply({
                    content: "Failed to find the track on spotify."
                });
            }

            const data = formatUrl(track);
            const message = interaction.options.getString("message");

            // Note: Due to how Discord handles commands, we need to manually create and send the message

            sendMessage(
                ctx.channel.id,
                { content: message ? `${message} ${data}` : data },
                false,
                MessageActions.getSendMessageOptionsForReply(PendingReplyStore.getPendingReply(ctx.channel.id))
            ).then(() => {
                FluxDispatcher.dispatch({ type: "DELETE_PENDING_REPLY", channelId: ctx.channel.id });
            });

        }
    };
}

export default definePlugin({
    name: "SpotifyShareCommands",
    description: "Share your current Spotify track, album or artist via slash command (/track, /album, /artist)",
    tags: ["Media", "Commands"],
    authors: [Devs.katlyn],
    commands: [
        makeCommand("track", track => `https://open.spotify.com/track/${track?.id}`),
        makeCommand("album", track => `https://open.spotify.com/album/${track?.album.id}`),
        makeCommand("artist", track => track?.artists[0].external_urls.spotify)
    ]
});
