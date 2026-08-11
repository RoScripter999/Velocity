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

import { VELOCITY_USER_AGENT } from "@shared/userAgent";
import { Logger } from "@utils/Logger";
import { TTLMap } from "@utils/TTLMap";

import { type ScrobblerBackend, settings, type TrackData } from ".";

const logger = new Logger("AudioScrobblerRichPresence/ListenBrainz");

// 15 minutes
const coverArtCache = new TTLMap<string, string>(15 * 60 * 1000);
const metadataCache = new TTLMap<string, Partial<TrackData> | null>(15 * 60 * 1000);

const isCustomInstance = () => settings.store.scrobblerBackend === "listenbrainz-compatible";
const url = (path: string) => `${isCustomInstance() ? settings.store.instanceBaseURL : "https://listenbrainz.org"}${path}`;
const apiUrl = (path: string) => `${isCustomInstance() ? settings.store.instanceAPIBaseUrl : "https://api.listenbrainz.org"}${path}`;

export function invalidateListenBrainzCache() {
    coverArtCache.clear();
    metadataCache.clear();
}

const YoutubeVideoURLRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|live\/|v\/)?)([\w-]+)(\S+)?$/;

function fallbackToYoutubeThumbnail(originUrl: string | undefined): string | undefined {
    if (!originUrl) return undefined;

    const match = originUrl.match(YoutubeVideoURLRegex);
    return match ? `https://i.ytimg.com/vi/${match[5]}/maxresdefault.jpg` : undefined;
}

async function fetchCoverArt(releaseGroupMBID: string, originUrl?: string): Promise<string | undefined> {
    if (!releaseGroupMBID) return fallbackToYoutubeThumbnail(originUrl);

    if (coverArtCache.has(releaseGroupMBID)) {
        return coverArtCache.get(releaseGroupMBID);
    }

    const res = await fetch(`https://coverartarchive.org/release-group/${releaseGroupMBID}`);
    if (!res.ok) return fallbackToYoutubeThumbnail(originUrl);

    const url = await res.json()
        .then(json => json.images[0].thumbnails.large ?? fallbackToYoutubeThumbnail(originUrl));
    coverArtCache.set(releaseGroupMBID, url);

    return url;
}

async function getUrls(additionalInfo: Record<string, string> | undefined, trackName: string, artistName: string, releaseName: string): Promise<Partial<TrackData>> {
    // Well tagged music will have MBIDs which we can use directly. These are optional but highly recommended in ListenBrainz scrobbles.
    // If your music doesn't have these, it's highly recommended to use https://picard.musicbrainz.org/ to automatically add them
    if (additionalInfo?.recording_mbid) {
        const { release_group_mbid, release_mbid, recording_mbid, artist_mbids, origin_url } = additionalInfo;

        return {
            imageURL: await fetchCoverArt(release_group_mbid, origin_url),
            trackURL: recording_mbid ? url(`/track/${recording_mbid}`) : undefined,
            albumURL: release_group_mbid
                ? url(`/release-group/${release_group_mbid}`)
                : release_mbid
                    ? url(`/release/${release_mbid}`)
                    : undefined,
            artistURL: artist_mbids?.length ? url(`/artist/${artist_mbids[0]}`) : undefined
        };
    }

    // If no MBIDs are present, try to search for the track on MusicBrainz

    let rawQuery = `artist:"${artistName}" AND recording:"${trackName}"`;
    if (releaseName)
        rawQuery += ` AND album:"${releaseName}"`;
    const query = encodeURIComponent(rawQuery);

    if (metadataCache.has(query)) {
        return metadataCache.get(query) ?? {};
    }

    const params = new URLSearchParams({
        fmt: "json",
        limit: "1"
    });

    const metadata = await fetch("https://musicbrainz.org/ws/2/recording/?" + params + "&query=" + query, {
        headers: { "User-Agent": VELOCITY_USER_AGENT }
    })
        .then(res => res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${res.statusText}`)))
        .then(json => json.recordings?.[0]);

    if (!metadata) {
        const data = additionalInfo?.origin_url ? { imageURL: fallbackToYoutubeThumbnail(additionalInfo.origin_url) } : {};
        metadataCache.set(query, data);
        return data;
    }

    const artist = metadata["artist-credit"]?.[0]?.artist;
    const release = metadata.releases?.[0];

    const data: Partial<TrackData> = {
        imageURL: await fetchCoverArt(release?.["release-group"]?.id, additionalInfo?.origin_url),
        trackURL: url(`/track/${metadata.id}/`),
        albumURL: release?.id ? url(`/release/${release.id}/`) : release?.["release-group"]?.id ? url(`/release-group/${release["release-group"].id}/`) : undefined,
        artistURL: artist?.id ? url(`/artist/${artist.id}/`) : undefined
    };
    metadataCache.set(query, data);

    return data;
}

export const ListenBrainzScrobbler: ScrobblerBackend = {
    name: "ListenBrainz",
    id: "listenbrainz",

    async fetchTrackData(): Promise<TrackData | null> {
        try {
            const res = await fetch(apiUrl(`/1/user/${settings.store.username}/playing-now`));
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

            const data = await res.json().then(json => json.payload?.listens[0]);
            if (!data?.playing_now || !data?.track_metadata)
                return null;

            const { track_name, artist_name, release_name, additional_info } = data.track_metadata;

            const trackData = {
                name: track_name || "Unknown",
                artist: artist_name,
                album: release_name || "Unknown",
                serviceName: additional_info?.music_service_name || additional_info?.submission_client,
                ...await getUrls(additional_info, track_name, artist_name, release_name)
            } as TrackData;

            return trackData;
        } catch (e) {
            logger.error("Failed to query ListenBrainz API", e);
            // will clear the rich presence if API fails
            return null;
        }
    },

    getUserURL(username: string): string {
        return url(`/user/${username}`);
    }
};
