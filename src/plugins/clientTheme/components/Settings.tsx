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

import { ErrorCard } from "@components/ErrorBoundary";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { relativeLuminance } from "@plugins/clientTheme/utils/colorUtils";
import { createOrUpdateThemeColorVars } from "@plugins/clientTheme/utils/styleUtils";
import { classNameFactory } from "@utils/css";
import { findByCodeLazy } from "@webpack";
import { Buttons, ClientThemesBackgroundStore, ColorPicker, Field, Forms, ThemeStore, useStateFromStores } from "@webpack/common";

import { settings } from "..";

const saveClientTheme = findByCodeLazy('type:"UNSYNCED_USER_SETTINGS_UPDATE', '"system"===');

const cl = classNameFactory("vc-clientTheme-");

const colorPresets = [
    "#1E1514", "#172019", "#13171B", "#1C1C28", "#402D2D",
    "#3A483D", "#344242", "#313D4B", "#2D2F47", "#322B42",
    "#3C2E42", "#422938", "#b6908f", "#bfa088", "#d3c77d",
    "#86ac86", "#88aab3", "#8693b5", "#8a89ba", "#ad94bb"
];

function onPickColor(color: number) {
    const hexColor = color.toString(16).padStart(6, "0");

    settings.store.color = hexColor;
    createOrUpdateThemeColorVars(hexColor);
}

function setDiscordTheme(theme: string) {
    saveClientTheme({ theme });
}

export function ThemeSettingsComponent() {
    const currentTheme = useStateFromStores([ThemeStore], () => ThemeStore.theme);
    const isLightTheme = currentTheme === "light";
    const oppositeTheme = isLightTheme ? "Dark" : "Light";

    const nitroThemeEnabled = useStateFromStores([ClientThemesBackgroundStore], () => ClientThemesBackgroundStore.gradientPreset != null);

    const selectedLuminance = relativeLuminance(settings.store.color);

    let contrastWarning = false;
    let fixableContrast = true;

    if ((isLightTheme && selectedLuminance < 0.26) || !isLightTheme && selectedLuminance > 0.12) {
        contrastWarning = true;
    }

    if (selectedLuminance < 0.26 && selectedLuminance > 0.12) {
        fixableContrast = false;
    }

    // Light mode with values greater than 65 leads to background colors getting crushed together and poor text contrast for muted channels
    if (isLightTheme && selectedLuminance > 0.65) {
        contrastWarning = true;
        fixableContrast = false;
    }

    return (
        <div className={cl("settings")}>
            <div>
                <Field
                    label="Theme Color"
                    description="Add a color to your Discord client theme"
                    layout="horizontal"
                >
                    <ColorPicker
                        color={parseInt(settings.store.color, 16)}
                        onChange={onPickColor}
                        showEyeDropper={false}
                        suggestedColors={colorPresets}
                    />
                </Field>
            </div>
            {(contrastWarning || nitroThemeEnabled) && (<>
                <ErrorCard className={Margins.top8}>
                    <Forms.FormTitle tag="h2">Your theme won't look good!</Forms.FormTitle>

                    {contrastWarning && <Paragraph>{">"} Selected color won't contrast well with text</Paragraph>}
                    {nitroThemeEnabled && <Paragraph>{">"} Nitro themes aren't supported</Paragraph>}

                    <div className={cl("buttons-container")}>
                        {(contrastWarning && fixableContrast) && <Buttons.Button text={`Switch to ${oppositeTheme} mode`} onClick={() => setDiscordTheme(oppositeTheme)} variant="critical-primary" />}
                        {(nitroThemeEnabled) && <Buttons.Button text="Disable Nitro Theme" onClick={() => setDiscordTheme(currentTheme)} variant="critical-primary" />}
                    </div>
                </ErrorCard>
            </>)}
        </div>
    );
}

export function ResetThemeColorComponent() {
    return (
        <Buttons.Button text="Reset Theme Color" onClick={() => onPickColor(0x313338)} />
    );
}
