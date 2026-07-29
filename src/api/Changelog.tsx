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

import type { NewChangesSectionProps } from "@components/settings/tabs/changelog";
import { localStorage } from "@utils/localStorage";
import { Logger } from "@utils/Logger";
import { findByCodeLazy } from "@webpack";

import gitHash from "~git-hash";
import remote from "~git-remote";
import plugins from "~plugins";

import { type ChangelogEntry, Settings, type UpdateSession } from "./Settings";

export type { ChangelogEntry, UpdateSession };

const logger = new Logger("Changelog", "#39b7e0");
export const CLLogger = logger;

interface RepoComparison {
    commits: ChangelogEntry[];
    updatedPlugins: string[];
    removedPlugins: string[];
    fixedPlugins: string[];
    ok: boolean;
}

const RegisterDismissibleContent = findByCodeLazy(".candidates.set(");

async function fetchRepoComparison(fromHash: string): Promise<RepoComparison> {
    const empty: RepoComparison = { commits: [], updatedPlugins: [], removedPlugins: [], fixedPlugins: [], ok: false };
    try {
        const res = await fetch(
            `https://api.github.com/repos/${remote}/compare/${fromHash}...${gitHash}`,
            { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!res.ok) return empty;
        const data = await res.json();

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
            }).reverse()
            : [];

        const updatedPlugins = new Set<string>();
        const removedPlugins = new Set<string>();
        if (Array.isArray(data.files)) {
            for (const file of data.files) {
                const match = file.filename.match(/^src\/plugins\/([^/]+)\//);
                if (match) {
                    const pluginName = match[1];
                    if (pluginName.startsWith("_")) continue;

                    if (file.status === "removed") {
                        removedPlugins.add(pluginName);
                    } else {
                        updatedPlugins.add(pluginName);
                    }
                }
            }
        }

        for (const name of updatedPlugins) {
            removedPlugins.delete(name);
        }

        const fixedPlugins = new Set<string>();
        for (const commit of commits) {
            const isFix = /^(fix(e[sd])?)(\(.+?\))?:\s*/i.test(commit.message);
            if (isFix) {
                const scopeMatch = commit.message.match(/^[^(]+?\(([^)]+?)\):/);
                if (scopeMatch) {
                    const scopeVal = scopeMatch[1].trim();
                    if (!scopeVal.startsWith("_")) {
                        fixedPlugins.add(scopeVal);
                    }
                }
            }
        }

        return {
            commits,
            updatedPlugins: [...updatedPlugins],
            removedPlugins: [...removedPlugins],
            fixedPlugins: [...fixedPlugins],
            ok: true
        };
    } catch {
        return empty;
    }
}

export function updateLastSeenHash() {
    Settings.changelog.lastSeenHash = gitHash;
}

function getKnownPlugins(): Set<string> {
    return new Set(Object.keys(Settings.changelog.knownPlugins || {}));
}

async function updateKnownPlugins(): Promise<void> {
    const known = { ...Settings.changelog.knownPlugins };
    const now = Math.floor(Date.now() / 1000);
    const currentPlugins = Object.keys(plugins);

    for (const p of currentPlugins) {
        if (p.startsWith("_")) continue;

        if (known[p] === undefined) {
            known[p] = now;
        }
    }

    Settings.changelog.knownPlugins = known;
}

export async function getLatestChangelogDisplay(): Promise<{
    commits: ChangelogEntry[];
    newPlugins: string[];
    updatedPlugins: string[];
    removedPlugins: string[];
    fixedPlugins: string[];
} | null> {
    const history = Settings.changelog.history || [];
    const latest = history[0];
    if (!latest) return null;
    return {
        commits: latest.commits,
        newPlugins: latest.newPlugins,
        updatedPlugins: latest.updatedPlugins,
        removedPlugins: latest.removedPlugins,
        fixedPlugins: latest.fixedPlugins
    };
}

export async function clearChangelogHistory(): Promise<void> {
    Settings.changelog.history = [];
}

export async function initializeChangelog(): Promise<NewChangesSectionProps | null> {
    const lastSeenHash = Settings.changelog.lastSeenHash;

    // First run — bootstrap known state and show nothing
    if (!lastSeenHash) {
        updateLastSeenHash();
        await updateKnownPlugins();
        return null;
    }

    // Already seen what's new for this build — caller uses persisted history
    if (lastSeenHash === gitHash) return null;

    const history = Settings.changelog.history;
    const newPlgs = Object.keys(plugins).filter(p => !p.startsWith("_") && !getKnownPlugins().has(p) && !plugins[p].hidden && !plugins[p].required);

    const comparison = await fetchRepoComparison(lastSeenHash);
    const commits = comparison.commits;
    const updatedPlugins = comparison.updatedPlugins.filter(p => !newPlgs.includes(p));
    const removedPlugins = comparison.removedPlugins.filter(p => !newPlgs.includes(p));
    const fixedPlugins = comparison.fixedPlugins.filter(p => !newPlgs.includes(p));

    // Couldn't verify the remote diff (network error, hash not pushed yet, etc).
    // Don't mark this hash as seen or update known state, so the next check retries the full range.
    if (!comparison.ok) {
        return (commits.length > 0 || newPlgs.length > 0 || updatedPlugins.length > 0)
            ? { commits, newPlugins: newPlgs, updatedPlugins, removedPlugins, fixedPlugins }
            : null;
    }

    // Mark as seen only after we have a confirmed comparison so it doesn't just
    // try to compare the hash with the current hash
    updateLastSeenHash();

    if (commits.length > 0 || newPlgs.length > 0 || updatedPlugins.length > 0) {
        history.unshift({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            fromHash: lastSeenHash,
            commits,
            newPlugins: newPlgs,
            updatedPlugins,
            removedPlugins,
            fixedPlugins
        });
        if (history.length > 50) history.splice(50);
        Settings.changelog.history = history;

        await updateKnownPlugins();

        return { commits, newPlugins: newPlgs, updatedPlugins, removedPlugins, fixedPlugins };
    }

    await updateKnownPlugins();

    // Nothing new found return null so the "caller" falls back to the saved history
    return null;
}

export function markAsSeen() {
    delete localStorage.Velocity_hasNewChangelog;
}

export function hasNewChangelog() {
    return localStorage.Velocity_hasNewChangelog;
}

export function initChangelog() {
    // Flag unacknowledged changelog changes on startup for the badge to appear in ste
    const lastSeen = Settings.changelog.lastSeenHash;
    if (lastSeen && lastSeen !== gitHash) {
        localStorage.Velocity_hasNewChangelog = true;
    }

    try {
        RegisterDismissibleContent({ content: "velocity_changelog_" + gitHash });
    } catch (err) {
        logger.error("Failed to register changelog dismissible content key", err);
    }
}
