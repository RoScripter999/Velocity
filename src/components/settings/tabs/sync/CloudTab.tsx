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
import { authorizeCloud, deauthorizeCloud } from "@api/SettingsSync/cloudSetup";
import { deleteCloudSettings, eraseAllCloudData, getCloudSettings, putCloudSettings } from "@api/SettingsSync/cloudSync";
import { Flex } from "@components/Flex";
import { FormSwitch } from "@components/FormSwitch";
import { CloudUploadIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab } from "@components/settings/tabs/SectionSettings";
import { localStorage } from "@utils/localStorage";
import { Alerts, Buttons, Field, Forms, Icons, Select, TextInput, Tooltip, useState } from "@webpack/common";

function validateUrl(url: string) {
    try {
        new URL(url);
        return null;
    } catch {
        return "Invalid URL";
    }
}

function CloudSetupSection() {
    const { cloud } = useSettings(["cloud.authenticated", "cloud.url"]);
    const [urlError, setUrlError] = useState<string>();

    return (
        <Forms.FormSection title="Cloud Integrations">
            <Paragraph size="md" className={Margins.bottom20}>
                Velocity comes with a cloud integration that adds goodies like settings sync across devices.
            </Paragraph>
            <FormSwitch
                title="Enable Cloud Integrations"
                description="This will request authorization if you have not yet set up cloud integrations."
                value={cloud.authenticated}
                onChange={v => {
                    if (v)
                        authorizeCloud();
                    else
                        cloud.authenticated = v;
                }}
            />
            <Field label="Backend URL" description="Which backend to use when using cloud integrations." />
            <Flex flexDirection="row" >
                <TextInput
                    value={cloud.url}
                    error={urlError}
                    onChange={v => {
                        const err = validateUrl(v);
                        setUrlError(err === null ? undefined : err);
                        if (err === null) {
                            cloud.url = v;
                            cloud.authenticated = false;
                            deauthorizeCloud();
                        }
                    }}
                />

                <Buttons.Button
                    variant="primary"
                    text="Reauthorise"
                    disabled={!cloud.authenticated}
                    icon={Icons.RetryIcon}
                    onClick={async () => {
                        await deauthorizeCloud();
                        cloud.authenticated = false;
                        await authorizeCloud();
                    }}
                />
            </Flex>
        </Forms.FormSection>
    );
}

function SettingsSyncSection() {
    const { cloud } = useSettings(["cloud.authenticated", "cloud.settingsSync"]);
    const sectionEnabled = cloud.authenticated && cloud.settingsSync;
    const [state, setState] = useState(localStorage.Velocity_cloudSyncDirection);

    return (
        <Forms.FormSection title="Settings Sync">
            <Flex flexDirection="column" gap="1em">
                <FormSwitch
                    title="Enable Settings Sync"
                    description="Save your Velocity settings to the cloud so you can easily keep them the same on all your devices"
                    value={cloud.settingsSync}
                    onChange={v => { cloud.settingsSync = v; }}
                    disabled={!cloud.authenticated}
                    hideBorder
                />

                <Field
                    label="Sync Rules for This Device"
                    description="This setting controls how settings move between this device and the cloud. You can let changes flow both ways, or choose one place to be the main source of truth."
                />
                <Select
                    options={[
                        {
                            label: "Two-way sync (changes go both directions)",
                            value: "both",
                            default: true
                        },
                        {
                            label: "This device is the source (upload only)",
                            value: "push"
                        },
                        {
                            label: "The cloud is the source (download only)",
                            value: "pull"
                        },
                        {
                            label: "Do not sync automatically (manual sync via buttons below only)",
                            value: "manual"
                        }
                    ]}
                    isSelected={v => v === state}
                    serialize={v => String(v)}
                    select={v => {
                        setState(v);
                        localStorage.Velocity_cloudSyncDirection = v;
                    }}
                    closeOnSelect={true}
                />

                <Buttons.ButtonGroup className={Margins.top16} direction="horizontal">
                    <Buttons.Button
                        variant="active"
                        text="Upload Settings"
                        disabled={!sectionEnabled}
                        icon={CloudUploadIcon}
                        onClick={() => putCloudSettings(true)}
                    />
                    <Tooltip text="This will replace your current settings with the ones saved in the cloud. Be careful!">
                        {({ onMouseLeave, onMouseEnter }) => (
                            <Buttons.Button
                                variant="critical-primary"
                                text="Download Settings"
                                disabled={!sectionEnabled}
                                icon={Icons.CloudDownloadIcon}
                                onMouseLeave={onMouseLeave}
                                onMouseEnter={onMouseEnter}
                                onClick={() => getCloudSettings(true, true)}
                            />
                        )}
                    </Tooltip>
                </Buttons.ButtonGroup>
            </Flex>
        </Forms.FormSection>
    );
}

function ResetSection() {
    const { authenticated, settingsSync } = useSettings(["cloud.authenticated", "cloud.settingsSync"]).cloud;

    return (
        <Forms.FormSection title="Reset Cloud Data">
            <Paragraph size="md" className={Margins.bottom20}>
                Permanently delete your cloud settings or erase your entire cloud account.
            </Paragraph>
            <Buttons.ButtonGroup direction="horizontal">
                <Buttons.Button
                    variant="critical-primary"
                    text="Delete Settings from Cloud"
                    icon={() => <Icons.TrashIcon color="currentColor" />}
                    disabled={!authenticated || !settingsSync}
                    onClick={() => deleteCloudSettings()}
                />
                <Buttons.Button
                    variant="critical-primary"
                    text="Delete your Cloud Account"
                    icon={() => <Icons.TrashIcon color="currentColor" />}
                    disabled={!authenticated}
                    onClick={() => Alerts.show({
                        title: "Are you sure?",
                        body: "Once your data is erased, we cannot recover it. There's no going back!",
                        onConfirm: eraseAllCloudData,
                        confirmText: "Erase it!",
                        cancelText: "Nevermind"
                    })}
                />
            </Buttons.ButtonGroup>
        </Forms.FormSection>
    );
}

export default function CloudTab() {
    return (
        <SettingsTab>
            <Flex flexDirection="column" gap="1em">
                <CloudSetupSection />
                <Forms.FormDivider />
                <SettingsSyncSection />
                <Forms.FormDivider />
                <ResetSection />
            </Flex>
        </SettingsTab>
    );
}
