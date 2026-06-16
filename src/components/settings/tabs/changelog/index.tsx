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

import "./styles.css";

import { Card } from "@components/Card";
import { ErrorCard } from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { SectionHeader, SettingsTab } from "@components/settings";
import { HashLink, Repo } from "@components/settings/tabs/updater/Components";
import { useAwaiter } from "@utils/react";
import { getRepo, UpdateLogger } from "@utils/updater";
import { Buttons, ConfirmModal, Forms, Icons, openModal, Text, useEffect, useState } from "@webpack/common";

import gitHash from "~git-hash";

import {
    type ChangelogEntry,
    type ChangelogHistory,
    clearChangelogHistory,
    clearIndividualLog,
    formatTimestamp,
    getChangelogHistory,
    getCommitsSinceLastSeen,
    getNewPlugins,
    getNewSettings,
    getNewSettingsEntries,
    getNewSettingsSize,
    getUpdatedPluginsInRange,
    initializeChangelog,
    saveUpdateSession,
    type UpdateSession
} from "./changelogManager";
import { PluginChanges } from "./NewPluginsSection";

function ChangelogCard({ entry, repo, repoPending }: { entry: ChangelogEntry; repo: string; repoPending: boolean; }) {
    return (
        <Card className="vc-changelog-entry">
            <div className="vc-changelog-entry-header">
                <code className="vc-changelog-entry-hash">
                    <HashLink repo={repo} hash={entry.hash} disabled={repoPending} />
                </code>
                <span className="vc-changelog-entry-author">by {entry.author}</span>
            </div>
            <div className="vc-changelog-entry-message">{entry.message}</div>
        </Card>
    );
}

function UpdateLogCard({
    log,
    repo,
    repoPending,
    onClearLog
}: {
    log: UpdateSession;
    repo: string;
    repoPending: boolean;
    onClearLog: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);

    const isUpToDate = log.fromHash === log.toHash;
    const isRepoFetch = log.type === "repository_fetch" || (log.type === undefined && isUpToDate && log.commits.length === 0);
    const title = isRepoFetch
        ? isUpToDate
            ? `Repository check: ${log.fromHash.slice(0, 7)} (up to date)`
            : `Repository check: ${log.fromHash.slice(0, 7)} → ${log.toHash.slice(0, 7)}`
        : `Update: ${log.fromHash.slice(0, 7)} → ${log.toHash.slice(0, 7)}`;

    const hasNewSettings = log.newSettings && getNewSettingsSize(log.newSettings) > 0;

    return (
        <Card>
            <div className="vc-changelog-log-header" onClick={() => setExpanded(c => !c)}>
                <div>
                    <Text variant="text-sm/semibold">{title}</Text>
                    <Text variant="text-xs/normal" color="text-muted">
                        {formatTimestamp(log.timestamp)}
                        {log.commits.length > 0 && ` · ${log.commits.length} commit${log.commits.length === 1 ? "" : "s"}`}
                        {(log.newPlugins?.length ?? 0) > 0 && ` · ${log.newPlugins.length} new plugins`}
                        {(log.updatedPlugins?.length ?? 0) > 0 && ` · ${log.updatedPlugins.length} updated`}
                        {hasNewSettings && " · new settings"}
                    </Text>
                </div>
                <div className="vc-changelog-log-actions" onClick={e => e.stopPropagation()}>
                    <Buttons.IconButton
                        icon={() => <Icons.TrashIcon color="var(--icon-feedback-critical)" />}
                        variant="secondary"
                        size="sm"
                        onClick={() => onClearLog(log.id)}
                    />
                    {expanded ? <Icons.ChevronSmallDownIcon /> : <Icons.ChevronSmallRightIcon />}
                </div>
            </div>

            {expanded && (
                <div className="vc-changelog-log-content">
                    {((log.newPlugins?.length ?? 0) > 0 || (log.updatedPlugins?.length ?? 0) > 0) && (
                        <div>
                            <Text variant="text-sm/semibold" className={Margins.bottom8}>Plugins</Text>
                            <PluginChanges added={log.newPlugins ?? []} modified={log.updatedPlugins ?? []} />
                        </div>
                    )}
                    {hasNewSettings && (
                        <div>
                            <Text variant="text-sm/semibold">New Settings</Text>
                            <div className="vc-changelog-plugin-list">
                                {getNewSettingsEntries(log.newSettings!).flatMap(([pluginName, settings]) =>
                                    settings.map(setting => (
                                        <span key={`${pluginName}-${setting}`} className="vc-changelog-plugin-tag">
                                            {pluginName}.{setting}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {log.commits.length > 0 && (
                        <div>
                            <Text variant="text-sm/semibold" className={Margins.bottom8}>Commits</Text>
                            <div className="vc-changelog-commits-list">
                                {log.commits.map(entry => (
                                    <ChangelogCard key={entry.hash} entry={entry} repo={repo} repoPending={repoPending} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

export default function ChangelogTab() {
    const [repo, repoErr, repoPending] = useAwaiter(getRepo, { fallbackValue: "" });
    const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
    const [changelogHistory, setChangelogHistory] = useState<ChangelogHistory>([]);
    const [newPlugins, setNewPlugins] = useState<string[]>([]);
    const [updatedPlugins, setUpdatedPlugins] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    async function reloadHistory() {
        setChangelogHistory(await getChangelogHistory());
    }

    async function fetchFromRepo() {
        const updates = await VelocityNative.updater.getUpdates();
        if (!updates.ok) throw new Error(updates.error?.message ?? "Failed to fetch");

        if (updates.value.length > 0) {
            const latestHash = updates.value[0].hash;
            const [newPlgs, newSettings, updatedPlgs] = await Promise.all([
                getNewPlugins(),
                getNewSettings(),
                getUpdatedPluginsInRange(repo, gitHash, latestHash)
            ]);
            const filteredUpdated = updatedPlgs.filter(p => !newPlgs.includes(p));
            setChangelog(updates.value);
            setNewPlugins(newPlgs);
            setUpdatedPlugins(filteredUpdated);
            await saveUpdateSession(updates.value, newPlgs, filteredUpdated, newSettings, true);
        } else {
            setChangelog([]);
            setNewPlugins([]);
            setUpdatedPlugins([]);
        }
        await reloadHistory();
    }

    useEffect(() => {
        if (repoPending) return;

        async function init() {
            try {
                await initializeChangelog();
                await reloadHistory();
                setNewPlugins(await getNewPlugins());

                if (!repoErr) {
                    const { commits: localCommits, updatedPlugins: localUpdated } = await getCommitsSinceLastSeen(repo);
                    if (localCommits.length > 0) {
                        const [newPlgs, newSettings] = await Promise.all([getNewPlugins(), getNewSettings()]);
                        const filteredUpdated = localUpdated.filter(p => !newPlgs.includes(p));
                        await saveUpdateSession(localCommits, newPlgs, filteredUpdated, newSettings);
                        setChangelog(localCommits);
                        setNewPlugins(newPlgs);
                        setUpdatedPlugins(filteredUpdated);
                        await reloadHistory();
                        return;
                    }
                    await fetchFromRepo();
                }
            } catch (e) {
                console.error("Changelog init failed", e);
            } finally {
                setIsLoading(false);
            }
        }

        init();
    }, [repoPending]);

    async function handleFetchClick() {
        setIsLoading(true);
        setError(null);
        try {
            await fetchFromRepo();
        } catch (e: any) {
            UpdateLogger.error("Failed to fetch commits", e);
            const raw: string = e?.message ?? "";
            let msg = raw;
            try {
                const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0];
                if (jsonStr) msg = JSON.parse(jsonStr).message ?? raw;
            } catch { }
            setError(msg || "Failed to connect to repository");
        } finally {
            setIsLoading(false);
        }
    }

    function confirmClearAll() {
        openModal(props => (
            <ConfirmModal
                {...props}
                title="Clear All Logs"
                subtitle="Are you sure you want to clear all logs? This can't be undone."
                confirmText="Clear All"
                variant="critical-primary"
                cancelText="Cancel"
                onConfirm={async () => {
                    await clearChangelogHistory();
                    await reloadHistory();
                    setShowHistory(false);
                }}
            />
        ));
    }

    function confirmClearLog(logId: string) {
        openModal(props => (
            <ConfirmModal
                {...props}
                title="Clear Log"
                subtitle="Are you sure you want to clear this log? This can't be undone."
                confirmText="Clear"
                variant="critical-primary"
                cancelText="Cancel"
                onConfirm={async () => {
                    await clearIndividualLog(logId);
                    await reloadHistory();
                }}
            />
        ));
    }

    const hasCurrentChanges = changelog.length > 0 || newPlugins.length > 0 || updatedPlugins.length > 0;

    return (
        <SettingsTab>
            <SectionHeader
                tag="h3"
                title="Fetch Changes"
                description="Check the repository for new commits, plugin updates, and code changes."
                descriptionColor="text-default"
                margin="bottom8"
            />

            <Flex flexWrap="wrap" alignItems="center" gap="0.5em" className={Margins.bottom16}>
                <Buttons.Button
                    size="sm"
                    disabled={isLoading || repoPending || !!repoErr}
                    onClick={handleFetchClick}
                    loading={isLoading}
                    text="Fetch from Repository"
                />
                {changelogHistory.length > 0 && (
                    <>
                        <Buttons.Button
                            size="sm"
                            text={showHistory ? "Hide Logs" : `Show Logs (${changelogHistory.length})`}
                            variant={showHistory ? "primary" : "secondary"}
                            onClick={() => setShowHistory(c => !c)}
                        />
                        <Buttons.Button
                            size="sm"
                            variant="critical-primary"
                            text="Clear All Logs"
                            onClick={confirmClearAll}
                        />
                    </>
                )}
            </Flex>

            {error && (
                <ErrorCard>
                    <Paragraph>{error}</Paragraph>
                    <Paragraph color="text-subtle" style={{ marginTop: "0.5em" }}>
                        Check your internet connection and try again.
                    </Paragraph>
                </ErrorCard>
            )}

            <Forms.FormDivider className={Margins.bottom16} />
            <Forms.FormTitle tag="h5">Repository</Forms.FormTitle>

            <Repo gitHash={gitHash} />


            {hasCurrentChanges && (
                <>
                    <Forms.FormDivider gap={18} />
                    <SectionHeader
                        tag="h3"
                        title="Recent Changes"
                        description="New commits and plugin updates since your last version."
                        className={Margins.bottom16}
                    />

                    {(newPlugins.length > 0 || updatedPlugins.length > 0) && (
                        <div className={Margins.bottom16}>
                            <Text variant="text-sm/semibold" className={Margins.bottom8}>Plugin Changes</Text>
                            <PluginChanges added={newPlugins} modified={updatedPlugins} />
                        </div>
                    )}
                    {changelog.length > 0 && (
                        <div>
                            <Text variant="text-sm/semibold" className={Margins.bottom8}>
                                Code Changes ({changelog.length} {changelog.length === 1 ? "commit" : "commits"})
                            </Text>
                            <div className="vc-changelog-commits-list">
                                {changelog.map(entry => (
                                    <ChangelogCard key={entry.hash} entry={entry} repo={repo} repoPending={repoPending} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!hasCurrentChanges && !isLoading && !error && (
                <>
                    <Forms.FormDivider gap={12} />
                    <SectionHeader
                        tag="h3"
                        title="Recent Changes"
                        description="No commits ahead of your current version. Click Fetch from Repository to check for new changes."
                    />
                </>
            )}

            {showHistory && changelogHistory.length > 0 && (
                <>
                    <Forms.FormDivider className={Margins.bottom16} />
                    <SectionHeader
                        tag="h3"
                        title={`Update Logs (${changelogHistory.length})`}
                        description="History of your previous update sessions."
                        className={Margins.bottom16}
                    />
                    <Flex flexDirection="column" gap="0.5em">
                        {changelogHistory.map(log => (
                            <UpdateLogCard
                                key={log.id}
                                log={log}
                                repo={repo}
                                repoPending={repoPending}
                                onClearLog={confirmClearLog}
                            />
                        ))}
                    </Flex>
                </>
            )}
        </SettingsTab>
    );
}
