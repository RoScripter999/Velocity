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

import { Margins } from "@components/margins";
import { Switch } from "@components/Switch";
import type { ModalPropsRender } from "@velocity-types";
import { Forms, Modal, SearchableSelect, useMemo } from "@webpack/common";

import { settings } from "./settings";
import { getLanguages } from "./utils";

const LanguageSettingKeys = ["receivedInput", "receivedOutput", "sentInput", "sentOutput"] as const;

function LanguageSelect({ settingsKey, includeAuto }: { settingsKey: typeof LanguageSettingKeys[number]; includeAuto: boolean; }) {
    const currentValue = settings.use([settingsKey])[settingsKey];

    const options = useMemo(
        () => {
            const options = Object.entries(getLanguages()).map(([value, label]) => ({ value, label, id: value }));
            if (!includeAuto)
                options.shift();

            return options;
        }, []
    );

    return (
        <section className={Margins.bottom16}>
            <SearchableSelect
                options={options}
                selectionMode="single"
                label={settings.def[settingsKey].description}
                value={options.find(o => o.value === currentValue)?.value}
                placeholder="Select a language"
                onSelectionChange={v => settings.store[settingsKey] = v}
            />
        </section>
    );
}

function AutoTranslateToggle() {
    const value = settings.use(["autoTranslate"]).autoTranslate;

    return (
        <Switch
            label="Auto Translate"
            description={settings.def.autoTranslate.description}
            checked={value}
            onChange={v => settings.store.autoTranslate = v}
            gap={false}
        />
    );
}


export function TranslateModal({ rootProps }: { rootProps: ModalPropsRender; }) {
    return (
        <Modal
            {...rootProps}
            title="Translate"
        >
            {LanguageSettingKeys.map(s => (
                <LanguageSelect
                    key={s}
                    settingsKey={s}
                    includeAuto={s.endsWith("Input")}
                />
            ))}

            <Forms.FormDivider className={Margins.bottom16} />

            <AutoTranslateToggle />
        </Modal>
    );
}
