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

import { Margins } from "@components/margins";
import { SectionHeader, SettingsTab } from "@components/settings";
import { Repo } from "@components/settings/tabs/updater/Components";
import { classNameFactory } from "@utils/css";
import { useAwaiter } from "@utils/react";
import { getRepo, UpdateLogger } from "@utils/updater";
import { Buttons, Forms, Icons, Text, useEffect, useState } from "@webpack/common";

import {
    type ChangelogEntry,
    clearChangelogHistory,
    getLatestChangelogDisplay,
    initializeChangelog
} from "./changelogManager";
import { NewChangesSection } from "./NewChangesSection";

export const cl = classNameFactory("vc-settings-changelog-");

export default function ChangelogTab() {
    const [repo, repoErr, repoPending] = useAwaiter(getRepo, { fallbackValue: "" });
    const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
    const [newPlugins, setNewPlugins] = useState<string[]>([]);
    const [updatedPlugins, setUpdatedPlugins] = useState<string[]>([]);

    useEffect(() => {
        if (!repo || repoPending) return;
        initializeChangelog(repo)
            .then(async result => {
                if (result) {
                    setChangelog(result.commits);
                    setNewPlugins(result.newPlugins);
                    setUpdatedPlugins(result.updatedPlugins);
                } else {
                    const persisted = await getLatestChangelogDisplay();
                    if (persisted) {
                        setChangelog(persisted.commits);
                        setNewPlugins(persisted.newPlugins);
                        setUpdatedPlugins(persisted.updatedPlugins);
                    }
                }
            })
            .catch(e => UpdateLogger.error("Failed to initialize changelog", e));
    }, [repo, repoPending]);

    const hasCurrentChanges = changelog.length > 0 || newPlugins.length > 0 || updatedPlugins.length > 0;

    return (
        <SettingsTab>
            <SectionHeader
                tag="h3"
                title="What's New"
                description="Commits and plugin changes since your last update."
                descriptionColor="text-default"
                margin="bottom8"
            />

            <Buttons.ButtonGroup className={Margins.bottom16} direction="horizontal" fullWidth>
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
                    <Text variant="heading-lg/semibold" color="text-muted">You're up to date — no new changes since last update</Text>
                </div>
            </div>}
        </SettingsTab>
    );
}
