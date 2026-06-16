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
import { FormSwitch } from "@components/FormSwitch";
import { Heading } from "@components/Heading";
import { SettingsTab } from "@components/settings/tabs/SectionSettings";
import { isNewer } from "@utils/updater";
import { Forms, useState } from "@webpack/common";

import gitHash from "~git-hash";

import { SectionHeader } from "../SectionHeader";
import { CommonProps, Newer, Repo, Updatable } from "./Components";

export default IS_UPDATER_DISABLED ? null : function Updater() {
    const settings = useSettings(["autoUpdate", "autoUpdateNotification"]);
    const [checkingUpdate, setCheckingUpdate] = useState(false);

    const commonProps: CommonProps = { checkingUpdate, setCheckingUpdate };

    return (
        <SettingsTab>
            <SectionHeader
                title="Update Preferences"
                titleVariant="heading-md/medium"
                description="Control how Velocity keeps itself up to date. You can choose to update automatically in the background or be notified when new updates are available."
                descriptionColor="text-default"
                margin="bottom20"
            />
            <FormSwitch
                title="Automatically update"
                description="Automatically update Velocity without confirmation prompt"
                value={settings.autoUpdate}
                onChange={v => settings.autoUpdate = v}
            />
            <FormSwitch
                title="Get notified when an automatic update completes"
                description="Show a notification when Velocity automatically updates"
                value={settings.autoUpdateNotification}
                onChange={v => settings.autoUpdateNotification = v}
                disabled={!settings.autoUpdate}
            />

            <Heading tag="h5">Repository</Heading>

            <Repo gitHash={gitHash} />

            <Forms.FormDivider gap={8} />

            <Heading tag="h5">Updates</Heading>

            {isNewer ? <Newer {...commonProps} /> : <Updatable {...commonProps} />}
        </SettingsTab>
    );
};
