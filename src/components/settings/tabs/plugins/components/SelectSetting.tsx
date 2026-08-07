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

import { useAwaiter } from "@utils/react";
import type { PluginSettingSelectDef } from "@utils/types";
import { SearchableSelect, Select, useState } from "@webpack/common";

import { resolveError, type SettingProps, SettingsSection } from "./Common";

export function SelectSetting({ setting, pluginSettings, definedSettings, onChange, id }: SettingProps<PluginSettingSelectDef>) {
    const def = pluginSettings[id];

    const [state, setState] = useState<any>(def ?? null);
    const [error, setError] = useState<string | null>(null);

    // Select returns an array if its in multiple mode duh
    const isMultiple = Array.isArray(setting.default);

    const [options] = useAwaiter(async () => typeof setting.options === "function" ? await setting.options() : setting.options, {
        fallbackValue: []
    });

    function handleChange(newValue: any) {
        const resolved = newValue ?? options.find(o => o.default)?.value ?? null;
        const isValid = setting.isValid?.call(definedSettings, resolved) ?? true;

        setState(resolved);
        setError(resolveError(isValid));

        if (isValid === true) onChange(resolved);
    }

    return (
        <SettingsSection name={setting.displayName} id={id} description={setting.description} error={error}>
            {options.length > 10 ? (
                <SearchableSelect
                    placeholder={setting.placeholder ?? "Select an option"}
                    options={options}
                    value={state}
                    selectionMode={isMultiple ? "multiple" : "single"}
                    hideTags={isMultiple}
                    closeOnSelect={!isMultiple}
                    onSelectionChange={handleChange}
                    formatOption={option => ({ ...option, id: option.value })}
                    {...setting.componentProps}
                />
            ) : (
                <Select
                    placeholder={setting.placeholder ?? "Select an option"}
                    options={options}
                    value={state}
                    selectionMode={isMultiple ? "multiple" : "single"}
                    onSelectionChange={handleChange}
                    closeOnSelect={!isMultiple}
                    clearable={!isMultiple && options.some(o => o.default) && state !== options.find(o => o.default)?.value}
                    formatOption={(opt: any) => ({
                        ...opt,
                        id: opt.value,
                        leading: opt.icon ? { type: "image", src: opt.icon } : undefined
                    })}
                    {...setting.componentProps}
                />
            )}
        </SettingsSection>
    );
}
