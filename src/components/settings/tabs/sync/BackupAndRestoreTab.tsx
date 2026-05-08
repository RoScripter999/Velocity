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

import { type BackupType, downloadSettingsBackup, importSettings, uploadSettingsBackup } from "@api/SettingsSync/offline";
import { Margins } from "@components/margins";
import { SectionHeader, SettingsTab } from "@components/settings";
import { wordsToTitle } from "@utils/text";
import { Buttons, Forms, Icons, Select, TextArea, useState } from "@webpack/common";

export default function BackupAndRestoreTab() {
    const [value, setValue] = useState("");
    const [importMode, setImportMode] = useState<BackupType>("all");

    const BUTTONS: { type: BackupType; label: string; }[] = [
        { type: "all", label: "All Settings" },
        { type: "plugins", label: "Plugins" },
        { type: "css", label: "QuickCSS" },
        { type: "datastore", label: "DataStore" }
    ];

    return (
        <SettingsTab>
            <div className={Margins.bottom20}>
                <SectionHeader
                    tag="h3"
                    title="Backup and Restore"
                    description="Backup your Velocity settings, QuickCSS, and DataStore. Import a previously exported or JSON to restore your settings."
                />
                <Forms.FormDivider gap={8} />
            </div>

            <section className={Margins.bottom20}>
                <SectionHeader
                    tag="h3"
                    title="File"
                    description="Import your settings using a backup settings file"
                    descriptionColor="text-default"
                    margin="bottom20"
                />

                <SectionHeader
                    tag="h5"
                    title="Import Settings"
                    description="Select a previously exported settings file to restore your configuration. This will replace all your current settings with the ones from the backup."
                    descriptionColor="text-default"
                    margin="bottom16"
                />
                <Buttons.ButtonGroup direction="horizontal" className={Margins.bottom20}>
                    {BUTTONS.map(({ type, label }) => (
                        <Buttons.Button
                            key={type}
                            onClick={() => uploadSettingsBackup(type)}
                            icon={type === "all" ? Icons.UploadIcon : undefined}
                            size="sm"
                            variant={type === "all" ? "secondary" : undefined}
                            text={wordsToTitle(["Import", label])}
                        />
                    ))}
                </Buttons.ButtonGroup>

                <Forms.FormDivider gap={12} />

                <SectionHeader
                    tag="h5"
                    title="Export Settings"
                    description="Download your current settings as a backup file. You can export everything at once, or choose to export only specific parts of your configuration."
                    descriptionColor="text-default"
                    margin="bottom16"
                />
                <Buttons.ButtonGroup direction="horizontal">
                    {BUTTONS.map(({ type, label }) => (
                        <Buttons.Button
                            key={type}
                            onClick={() => downloadSettingsBackup(type)}
                            icon={type === "all" ? Icons.DownloadIcon : undefined}
                            size="sm"
                            variant={type === "all" ? "secondary" : undefined}
                            text={wordsToTitle(["Export", label])}
                        />
                    ))}
                </Buttons.ButtonGroup>
            </section>

            <section>
                <SectionHeader
                    tag="h3"
                    title="JSON"
                    description="Paste a settings JSON directly to import without a file"
                    descriptionColor="text-default"
                    margin="bottom16"
                />

                <Select
                    label="Import Mode"
                    description="Import modes for importing your settings from JSON."
                    layout="horizontal"
                    options={[
                        { value: "all", label: "All Settings" },
                        { value: "plugins", label: "Plugins" },
                        { value: "css", label: "QuickCSS" },
                        { value: "datastore", label: "DataStore" }
                    ]}
                    isSelected={v => v === importMode}
                    select={setImportMode}
                    serialize={String}
                />
                <div className={Margins.top16}>
                    <TextArea
                        value={value}
                        onChange={setValue}
                        onBlur={async () => {
                            if (!value.trim()) return;
                            await importSettings(value, importMode, false, true);
                        }}
                        rows={14}
                        placeholder="Paste JSON here"
                    />
                </div>
            </section>
        </SettingsTab>
    );
}
