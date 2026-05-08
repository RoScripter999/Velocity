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

import { useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { SectionHeader, SettingsTab } from "@components/settings";
import { Switch } from "@components/Switch";
import { classes } from "@utils/misc";
import { findByCodeLazy } from "@webpack";
import { Icons, Select, Text } from "@webpack/common";

const experimentActions = findByCodeLazy("EXPERIMENT_OVERRIDE_BUCKET", "experimentId:", "experimentBucket:");

const THEME_SWITCHES = () => [
    {
        key: "manaToggleInputs",
        title: "Mana Toggle Inputs",
        description: "Enable the new mana toggle input components",
        experiment: { type: "apex", name: "2025-09-mana-toggle-inputs" },
        icon: Icons.ScienceIcon
    },
    {
        key: "manaTextInputs",
        title: "Mana Text Inputs",
        description: "Enable the new mana text input components",
        experiment: { type: "apex", name: "2025-09-mana-text-inputs" },
        icon: Icons.TextIcon
    },
    {
        key: "manaContextMenu",
        title: "Mana Context Menu",
        description: "Enable the new mana context menu redesign",
        experiment: { type: "apex", name: "2025-11-mana-context-menu" },
        icon: Icons.MenuIcon
    }
];

export function VelocityThemesTab() {
    const { velocityStyles } = useSettings(["velocityStyles.*"]);

    const handleSwitchChange = (key: string, val: boolean, experiment: any) => {
        velocityStyles[key] = val;
        if (experiment)
            experimentActions(experiment.type, experiment.name, val ? 1 : -1);
    };

    return (
        <SettingsTab>
            <SectionHeader
                title="Velocity Themes"
                titleVariant="heading-md/normal"
                tooltip="Some themes are powered by Discord experiments"
                description="Configure your discord UI designs with pre-built Velocity themes."
                descriptionColor="text-default"
                margin="bottom16"
            />

            <Card className="vc-settings-card">
                <SectionHeader title="Switch Redesign" margin="bottom8" />
                <Select
                    options={[
                        { label: "Built-in", value: false },
                        { label: "Redesigned", value: "redesigned" },
                        { label: "Legacy", value: "legacy" }
                    ]}
                    select={value => { velocityStyles.switchRedesign = value; }}
                    isSelected={value => value === velocityStyles.switchRedesign}
                    serialize={String}
                />
                {velocityStyles.switchRedesign === "redesigned" && (
                    <>
                        <Text className={classes(Margins.top16, Margins.bottom8)} variant="text-sm/semibold" color="text-muted">Additional Setting</Text>
                        <Switch
                            checked={velocityStyles.showRedesignedIcon ?? true}
                            onChange={val => { velocityStyles.showRedesignedIcon = val; }}
                            title="Show checkmark icon"
                            description="Show a litle icon in the middle of the thumb"
                        />
                    </>
                )}
            </Card>

            <Text className={classes(Margins.top16, Margins.bottom8)} variant="text-sm/semibold" color="text-subtle">Switches have diffrent sizes so they might look weird on this page!</Text>
            {THEME_SWITCHES().map(theme => (
                <Card key={theme.key} className="vc-settings-card">
                    <Flex alignItems="center" gap={12}>
                        <div style={{ flex: 1 }}>
                            <SectionHeader
                                icon={theme.icon}
                                title={theme.title}
                                description={theme.description}
                                layout="horizontal"
                            />
                        </div>
                        <Switch
                            checked={velocityStyles[theme.key] ?? false}
                            onChange={val => handleSwitchChange(theme.key, val, theme.experiment)}
                        />
                    </Flex>
                </Card>
            ))}
        </SettingsTab>
    );
}
