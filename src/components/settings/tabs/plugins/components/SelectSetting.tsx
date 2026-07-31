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

import type { PluginSettingSelectDef, PluginSettingSelectOption } from "@utils/types";
import { SearchableSelect, Select, useEffect, useState } from "@webpack/common";

import { resolveError, type SettingProps, SettingsSection } from "./Common";

export function SelectSetting({ setting, pluginSettings, definedSettings, onChange, id }: SettingProps<PluginSettingSelectDef>) {
    const [options, setOptions] = useState<PluginSettingSelectOption[]>(
        typeof setting.options === "function" ? [] : [...setting.options]
    );

    useEffect(() => {
        if (typeof setting.options === "function") {
            setting.options().then(opts => setOptions([...opts]));
        }
    }, []);

    const isMultiple = Array.isArray(setting.default);

    const defaultValue = isMultiple
        ? options.filter(o => o.default).map(o => o.value)
        : options.find(o => o.default)?.value ?? null;

    const [state, setState] = useState<any>(pluginSettings[id] ?? defaultValue);
    const [error, setError] = useState<string | null>(null);

    const isDefault = isMultiple
        ? JSON.stringify(state) === JSON.stringify(defaultValue)
        : state === defaultValue;

    function handleChange(newValue: any) {
        const isValid = setting.isValid?.call(definedSettings, newValue) ?? true;
        setState(newValue);
        setError(resolveError(isValid));
        if (isValid === true) onChange(newValue);
    }

    const renderOptionPrefix = (opt: any) => {
        if (!opt || !opt.icon) return null;
        const IconElement = typeof opt.icon === "function" ? opt.icon() : opt.icon;
        return IconElement;
    };

    return (
        <SettingsSection name={setting.displayName} id={id} description={setting.description} error={error}>
            {setting.searchable ? (
                <SearchableSelect
                    placeholder={setting.placeholder ?? "Select an option"}
                    options={options}
                    value={isMultiple ? state : options.find(o => o.value === state)}
                    selectionMode={isMultiple ? "multiple" : "single"}
                    hideTags={isMultiple}
                    closeOnSelect={!isMultiple}
                    onSelectionChange={handleChange}
                    formatOption={option => ({ ...option, id: option.value })}
                    {...setting.componentProps}
                />
            ) : <Select
                placeholder={setting.placeholder ?? "Select an option"}
                options={options}
                value={Array.isArray(state) ? state : [state]}
                selectionMode={isMultiple ? "multiple" : "single"}
                onSelectionChange={handleChange}
                closeOnSelect={!isMultiple}
                clearable={!isMultiple && !isDefault}
                formatOption={(opt: any) => ({
                    ...opt,
                    id: opt.value,
                    leading: opt.icon ? {
                        type: "avatar",
                        src: opt.icon
                    } : undefined
                })}
                {...setting.componentProps}
            />}
        </SettingsSection>
    );
}
