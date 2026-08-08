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

import ErrorBoundary from "@components/ErrorBoundary";
import { classNameFactory } from "@utils/css";
import { wordsFromCamel, wordsToTitle } from "@utils/text";
import type { DefinedSettings, PluginSettingDefCommon } from "@utils/types";
import { Field } from "@webpack/common";
import type { PropsWithChildren } from "react";

export const cl = classNameFactory("vc-plugins-setting-");

interface SettingBaseProps<T> {
    setting: T;
    onChange(newValue: any): void;
    pluginSettings: {
        [setting: string]: any;
        enabled: boolean;
    };
    id: string;
    definedSettings: DefinedSettings;
    closePluginSettings(): void;
}

export type SettingProps<T extends PluginSettingDefCommon> = SettingBaseProps<T>;
export type ComponentSettingProps<T extends Omit<PluginSettingDefCommon, "description" | "placeholder">> = SettingBaseProps<T>;

export function resolveError(isValidResult: boolean | string) {
    if (typeof isValidResult === "string") return isValidResult;

    return isValidResult ? null : "Invalid input provided";
}

interface SettingsSectionProps extends PropsWithChildren {
    name?: string;
    id: string;
    description: string;
    error?: string | null;
    inlineSetting?: boolean;
}


export function SettingsSection({ name, id, description, error, inlineSetting, children }: SettingsSectionProps) {
    return (
        <ErrorBoundary>
            <Field
                label={name ?? wordsToTitle(wordsFromCamel(id))}
                description={description}
                errorMessage={error || undefined}
                layout={inlineSetting ? "horizontal" : "vertical"}
                id={id}
            >
                {children}
            </Field>
        </ErrorBoundary>
    );
}
