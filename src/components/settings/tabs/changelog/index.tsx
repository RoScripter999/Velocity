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

import { ErrorCard } from "@components/ErrorBoundary";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { SectionHeader, SettingsTab } from "@components/settings";
import { Repo } from "@components/settings/tabs/updater/Components";
import { classNameFactory } from "@utils/css";
import { useAwaiter } from "@utils/react";
import { getRepo, UpdateLogger } from "@utils/updater";
import { Buttons, Forms, Icons, Text, useState } from "@webpack/common";

import gitHash from "~git-hash";

import {
    type ChangelogEntry,
    clearChangelogHistory,
    getNewPlugins,
    getNewSettings,
    getUpdatedPluginsInRange,
    saveUpdateSession
} from "./changelogManager";
import { NewChangesSection } from "./NewChangesSection";

export const cl = classNameFactory("vc-settings-changelog-");

export default function ChangelogTab() {
    const [repo, repoErr, repoPending] = useAwaiter(getRepo, { fallbackValue: "" });
    const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
    const [newPlugins, setNewPlugins] = useState<string[]>([]);
    const [updatedPlugins, setUpdatedPlugins] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
    }

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

            <Buttons.ButtonGroup className={Margins.bottom16} direction="horizontal" fullWidth>
                <Buttons.Button
                    size="sm"
                    text="Fetch from Repository"
                    variant="secondary"
                    disabled={isLoading || repoPending || !!repoErr}
                    loading={isLoading}
                    onClick={handleFetchClick}
                />
                <Buttons.IconButton
                    icon={Icons.TrashIcon}
                    variant="critical-secondary"
                    size="sm"
                    disabled={!hasCurrentChanges}
                    onClick={async () => {
                        await clearChangelogHistory();
                        setChangelog([]);
                        setNewPlugins([]);
                        setUpdatedPlugins([]);
                    }}
                />
            </Buttons.ButtonGroup>
            {error && (
                <ErrorCard>
                    <Paragraph>{error}</Paragraph>
                    <Paragraph color="text-subtle" style={{ marginTop: "0.5em" }}>
                        Check your internet connection and try again.
                    </Paragraph>
                </ErrorCard>
            )}

            <Forms.FormDivider gap={16} />
            <Repo repo={repo} repoPending={repoPending} error={repoErr} />

            {hasCurrentChanges ? (
                <>
                    <Forms.FormDivider gap={18} />
                    <NewChangesSection
                        commits={changelog}
                        newPlugins={newPlugins}
                        updatedPlugins={updatedPlugins}
                    />
                </>
            ) : <div className={cl("no-changes")}>
                <div className={cl("no-changes-inner")}>
                    <div className={cl("no-changes-background")} />
                    <Text variant="heading-lg/semibold" color="text-muted">No changes detected, check back later</Text>
                </div>
            </div>}
        </SettingsTab>
    );
}
