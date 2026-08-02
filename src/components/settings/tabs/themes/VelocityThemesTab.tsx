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

import { useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { SectionHeader, SettingsTab } from "@components/settings";
import { Switch } from "@components/Switch";
import { findByCodeLazy } from "@webpack";
import { Select } from "@webpack/common";

const ExperimentOverride = findByCodeLazy("EXPERIMENT_OVERRIDE_BUCKET", "experimentId:", "experimentBucket:");

const THEME_SWITCHES = [
    {
        key: "manaToggleInputs",
        title: "Mana Toggle Inputs",
        description: "Enable the new mana toggle input components",
        experiment: { type: "apex", name: "2025-09-mana-toggle-inputs" }
    },
    {
        key: "manaTextInputs",
        title: "Mana Text Inputs",
        description: "Enable the new mana text input components",
        experiment: { type: "apex", name: "2025-09-mana-text-inputs" }
    },
    {
        key: "manaContextMenu",
        title: "Mana Context Menu",
        description: "Enable the new mana context menu redesign",
        experiment: { type: "apex", name: "2025-11-mana-context-menu" }
    }
];

export function VelocityThemesTab() {
    const { velocityStyles } = useSettings(["velocityStyles.*"]);

    const handleSwitchChange = (key: string, val: boolean, experiment: any) => {
        velocityStyles[key] = val;
        if (experiment) ExperimentOverride(experiment.type, experiment.name, val ? 1 : -1);
    };

    return (
        <SettingsTab>
            <SectionHeader
                title="Velocity Themes"
                titleVariant="heading-md/normal"
                tooltip="Themes that are premade and built into the client."
                description="Configure your discord UI designs."
                descriptionColor="text-default"
                gap={{ bottom: 16 }}
            />

            <div style={{ marginBottom: "1.5em" }}>
                <Card className="vc-settings-card">
                    <Select
                        label="Switch Redesign"
                        description="Enable the new mana base switch"
                        layout="horizontal"
                        options={[
                            { label: "Built-in", value: false },
                            { label: "Redesigned", value: "redesigned" }
                        ]}
                        onSelectionChange={value => { velocityStyles.switchRedesign = value; }}
                        fullWidth
                        formatOption={option => ({ ...option, id: option.value })}
                        value={velocityStyles.switchRedesign}
                    />
                </Card>
                <Card className="vc-settings-card">
                    <Switch
                        checked={velocityStyles.showRedesignedIcon ?? true}
                        onChange={val => { velocityStyles.showRedesignedIcon = val; }}
                        label="Show checkmark icon"
                        description="Show a litle icon in the middle of the thumb"
                        gap={false}
                    />
                </Card>
            </div>
            {THEME_SWITCHES.map(theme => (
                <Card key={theme.key} className="vc-settings-card">
                    <Switch
                        label={theme.title}
                        description={theme.description}
                        checked={velocityStyles[theme.key] ?? false}
                        onChange={val => handleSwitchChange(theme.key, val, theme.experiment)}
                        gap={false}
                    />
                </Card>
            ))}
        </SettingsTab>
    );
}
