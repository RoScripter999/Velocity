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

import { isSettingDisabled } from "@api/PluginManager";
import type { PluginSettingRadioDef } from "@utils/types";
import { RadioGroup, useState } from "@webpack/common";

import { resolveError, type SettingProps, SettingsSection } from "./Common";

export function RadioSetting({ setting, pluginSettings, definedSettings, id, onChange }: SettingProps<PluginSettingRadioDef>) {
    const defaultValue = setting.options?.find(o => o.default)?.value ?? null;

    const [state, setState] = useState<any>(pluginSettings[id] ?? defaultValue);
    const [error, setError] = useState<string | null>(null);

    function handleChange(newValue: any) {
        const isValid = setting.isValid?.call(definedSettings, newValue) ?? true;

        setState(newValue);
        setError(resolveError(isValid));

        if (isValid === true) {
            onChange(newValue);
        }
    }

    return (
        <SettingsSection name={id} description={setting.description} error={error}>
            <RadioGroup
                value={state}
                options={setting.options.map(opt => ({
                    ...opt,
                    name: opt.label,
                    value: opt.value
                }))}
                onChange={handleChange}
                disabled={isSettingDisabled(definedSettings, setting)}
                {...setting.componentProps}
            />
        </SettingsSection>
    );
}
