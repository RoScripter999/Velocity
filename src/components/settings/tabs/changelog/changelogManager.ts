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

import * as DataStore from "@api/DataStore";

import gitHash from "~git-hash";
import plugins from "~plugins";

export interface ChangelogEntry {
    hash: string;
    author: string;
    message: string;
    timestamp?: number;
}

interface UpdateSession {
    id: string;
    timestamp: number;
    fromHash: string;
    toHash: string;
    commits: ChangelogEntry[];
    newPlugins: string[];
    updatedPlugins: string[];
    newSettings?: Record<string, string[]>;
    type: "update" | "repository_fetch";
}

const CHANGELOG_HISTORY_KEY = "Changelog_History";
const LAST_SEEN_HASH_KEY = "Changelog_LastSeenHash";
const KNOWN_PLUGINS_KEY = "Changelog_KnownPlugins";
const KNOWN_SETTINGS_KEY = "Changelog_KnownSettings";
const LAST_REPO_CHECK_KEY = "Changelog_LastRepoCheck";

type KnownPluginSettingsMap = Map<string, Set<string>>;

function normalizeRepoUrl(repoUrl: string | null | undefined): string | null {
    if (!repoUrl) return null;
    try {
        const url = new URL(repoUrl.replace(/^git\+/, ""));
        if (!url.hostname.endsWith("github.com")) return null;
        const segments = url.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
        if (segments.length < 2) return null;
        return `${segments[0]}/${segments[1]}`;
    } catch {
        return null;
    }
}

interface RepoComparison {
    commits: ChangelogEntry[];
    updatedPlugins: string[];
}

async function fetchRepoComparison(repoSlug: string, fromHash: string, toHash: string): Promise<RepoComparison> {
    const empty: RepoComparison = { commits: [], updatedPlugins: [] };
    if (!repoSlug || typeof fetch !== "function") return empty;
    try {
        const res = await fetch(
            `https://api.github.com/repos/${repoSlug}/compare/${fromHash}...${toHash}`,
            { headers: { Accept: "application/vnd.github+json", "Cache-Control": "no-cache" } }
        );
        if (!res.ok) return empty;
        const data = await res.json();
        if (!data) return empty;

        const commits: ChangelogEntry[] = Array.isArray(data.commits)
            ? data.commits.map((commit: any) => {
                const message: string = commit?.commit?.message ?? "";
                const timestamp = commit?.commit?.author?.date ? Date.parse(commit.commit.author.date) : undefined;
                return {
                    hash: commit?.sha || "",
                    author: commit?.commit?.author?.name || commit?.author?.login || "Unknown",
                    message: message.split("\n")[0] || "No message",
                    timestamp: Number.isNaN(timestamp) ? undefined : timestamp
                };
            })
            : [];

        const pluginNames = new Set<string>();
        if (Array.isArray(data.files)) {
            for (const file of data.files) {
                const match = (file.filename as string).match(/^src\/plugins\/([^/]+)\//);
                if (match) pluginNames.add(match[1]);
            }
        }

        return { commits, updatedPlugins: [...pluginNames] };
    } catch {
        return empty;
    }
}

async function persistKnownSettings(map: KnownPluginSettingsMap) {
    await DataStore.set(KNOWN_SETTINGS_KEY, Object.fromEntries(
        Array.from(map.entries()).map(([plugin, settings]) => [plugin, Array.from(settings)])
    ));
}

function getCurrentSettings(pluginList: string[]): KnownPluginSettingsMap {
    return new Map(pluginList.map(name => {
        const def = plugins[name]?.settings?.def || {};
        return [name, new Set(Object.keys(def).filter(s => s !== "enabled"))];
    }));
}

async function getLastSeenHash(): Promise<string | null> {
    return (await DataStore.get(LAST_SEEN_HASH_KEY))!;
}

async function setLastSeenHash(hash: string) {
    await DataStore.set(LAST_SEEN_HASH_KEY, hash);
}

async function getKnownPlugins(): Promise<Set<string>> {
    return new Set(((await DataStore.get(KNOWN_PLUGINS_KEY))) || []);
}

async function updateKnownPlugins(): Promise<void> {
    await DataStore.set(KNOWN_PLUGINS_KEY, Object.keys(plugins));
}

async function getKnownSettings(): Promise<KnownPluginSettingsMap> {
    const mapData = (await DataStore.get(KNOWN_SETTINGS_KEY));
    if (mapData === undefined) {
        const knownPlugins = await getKnownPlugins();
        const initialMap = getCurrentSettings([...new Set([...Object.keys(plugins), ...Array.from(knownPlugins)])]);
        await persistKnownSettings(initialMap);
        return initialMap;
    }

    const map: KnownPluginSettingsMap = new Map();
    if (mapData && typeof mapData === "object" && !Array.isArray(mapData)) {
        for (const [plugin, settings] of Object.entries(mapData)) {
            const set = new Set<string>();
            if (Array.isArray(settings)) settings.forEach(s => set.add(String(s)));
            map.set(plugin, set);
        }
    }
    return map;
}

export async function saveUpdateSession(
    commits: ChangelogEntry[],
    newPlugins: string[],
    updatedPlugins: string[],
    newSettings: Map<string, string[]>,
    forceLog: boolean = false
): Promise<void> {
    const history = (((await DataStore.get(CHANGELOG_HISTORY_KEY)) as UpdateSession[]) || []);
    const lastSeenHash = await getLastSeenHash();
    const currentHash = gitHash;
    const latestRepoHash = commits.length > 0 ? commits[0].hash : currentHash;
    const newSettingsObj = newSettings.size > 0 ? Object.fromEntries(newSettings) : undefined;

    if (forceLog) {
        const lastRepoCheck = (await DataStore.get(LAST_REPO_CHECK_KEY)) as string | null;
        if (lastRepoCheck === latestRepoHash) return;
    }

    if (!forceLog && commits.length === 0 && newPlugins.length === 0 && updatedPlugins.length === 0 && !newSettingsObj) {
        return;
    }

    history.unshift({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        fromHash: forceLog ? currentHash : (lastSeenHash || "unknown"),
        toHash: forceLog ? latestRepoHash : currentHash,
        commits,
        newPlugins,
        updatedPlugins,
        newSettings: newSettingsObj,
        type: forceLog ? "repository_fetch" : "update"
    });
    if (history.length > 50) history.splice(50);

    await DataStore.set(CHANGELOG_HISTORY_KEY, history);

    if (!forceLog) {
        await setLastSeenHash(currentHash);
    } else {
        await DataStore.set(LAST_REPO_CHECK_KEY, latestRepoHash);
    }

    await updateKnownPlugins();
    await updateKnownSettings();
}

export async function getNewSettings(): Promise<Map<string, string[]>> {
    const map = getCurrentSettings(Object.keys(plugins));
    const knownSettings = await getKnownSettings();
    const newSettings = new Map<string, string[]>();

    map.forEach((settings, plugin) => {
        const known = knownSettings.get(plugin);
        if (!known) return;
        const filtered = [...settings].filter(s => !known.has(s));
        if (filtered.length > 0) newSettings.set(plugin, filtered);
    });

    return newSettings;
}

export async function getUpdatedPluginsInRange(repoUrl: string, fromHash: string, toHash: string): Promise<string[]> {
    if (!fromHash || !toHash || fromHash === toHash) return [];
    const repoSlug = normalizeRepoUrl(repoUrl);
    if (!repoSlug) return [];
    return (await fetchRepoComparison(repoSlug, fromHash, toHash)).updatedPlugins;
}

async function updateKnownSettings(): Promise<void> {
    const currentSettings = getCurrentSettings(Object.keys(plugins));
    const knownSettings = await getKnownSettings();
    const merged: KnownPluginSettingsMap = new Map();

    new Set([...currentSettings.keys(), ...knownSettings.keys()]).forEach(plugin => {
        merged.set(plugin, new Set([...(knownSettings.get(plugin) || []), ...(currentSettings.get(plugin) || [])]));
    });

    await persistKnownSettings(merged);
}

export async function clearChangelogHistory(): Promise<void> {
    await Promise.all([
        DataStore.del(CHANGELOG_HISTORY_KEY),
        DataStore.del(LAST_SEEN_HASH_KEY),
        DataStore.del(LAST_REPO_CHECK_KEY),
        DataStore.del(KNOWN_SETTINGS_KEY)
    ]);
}

export async function getNewPlugins(): Promise<string[]> {
    const knownPlugins = await getKnownPlugins();
    return Object.keys(plugins).filter(p => !knownPlugins.has(p) && !plugins[p].hidden && !plugins[p].required);
}

export async function saveCurrentHashBeforeUpdate(): Promise<void> {
    await setLastSeenHash(gitHash);
}

export async function initializeChangelog(repoUrl: string): Promise<{
    commits: ChangelogEntry[];
    newPlugins: string[];
    updatedPlugins: string[];
} | null> {
    const lastSeenHash = await getLastSeenHash();
    const currentHash = gitHash;

    // First run — bootstrap known state and show nothing
    if (!lastSeenHash) {
        await setLastSeenHash(currentHash);
        await updateKnownPlugins();
        await updateKnownSettings();
        return null;
    }

    // Already seen what's new for this build
    if (lastSeenHash === currentHash) return null;

    // Mark as seen immediately so re-opening doesn't re-fetch
    await setLastSeenHash(currentHash);

    const repoSlug = normalizeRepoUrl(repoUrl);
    const [newPlgs, newSettings, comparison] = await Promise.all([
        getNewPlugins(),
        getNewSettings(),
        repoSlug
            ? fetchRepoComparison(repoSlug, lastSeenHash, currentHash)
            : Promise.resolve({ commits: [], updatedPlugins: [] })
    ]);

    const filteredUpdated = comparison.updatedPlugins.filter(p => !newPlgs.includes(p));

    if (comparison.commits.length > 0 || newPlgs.length > 0 || filteredUpdated.length > 0 || newSettings.size > 0) {
        const history = (((await DataStore.get(CHANGELOG_HISTORY_KEY)) as UpdateSession[]) || []);
        history.unshift({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            fromHash: lastSeenHash,
            toHash: currentHash,
            commits: comparison.commits,
            newPlugins: newPlgs,
            updatedPlugins: filteredUpdated,
            newSettings: newSettings.size > 0 ? Object.fromEntries(newSettings) : undefined,
            type: "update"
        });
        if (history.length > 50) history.splice(50);
        await DataStore.set(CHANGELOG_HISTORY_KEY, history);
    }

    await updateKnownPlugins();
    await updateKnownSettings();

    return {
        commits: comparison.commits,
        newPlugins: newPlgs,
        updatedPlugins: filteredUpdated
    };
}

