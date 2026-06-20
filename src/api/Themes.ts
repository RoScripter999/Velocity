/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2026 RoScripter999 and contributors
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

import { Settings, SettingsStore, type ThemeActivationMode } from "@api/Settings";
import { createAndAppendStyle } from "@utils/css";
import { ThemeStore } from "@velocity-types";
import { PopoutWindowStore } from "@webpack/common";

import { coreStyleRootNode, managedStyleRootNode, userStyleRootNode, velocityRootNode } from "./Styles";

let style: HTMLStyleElement;
let themesStyle: HTMLStyleElement;

function shouldApplyTheme(mode: ThemeActivationMode, activeTheme?: "light" | "dark") {
    if (mode === "always") return true;
    if (!activeTheme) return false;
    return mode === activeTheme;
}

async function toggle(isEnabled: boolean) {
    if (!style) {
        if (isEnabled) {
            style = createAndAppendStyle("velocity-custom-css", userStyleRootNode);
            VelocityNative.quickCss.addChangeListener(css => {
                style.textContent = css;
                // At the time of writing this, changing textContent resets the disabled state
                style.disabled = !Settings.useQuickCss;
                updatePopoutWindows();
            });
            style.textContent = await VelocityNative.quickCss.get();
        }
    } else
        style.disabled = !isEnabled;
}

async function initThemes() {
    themesStyle ??= createAndAppendStyle("velocity-themes", userStyleRootNode);
    await rebuildThemes();
}

const themeVersions = new Map<string, number>();

async function rebuildThemes() {
    const { onlineThemes, onlineThemesEnabled, localThemes } = Settings.themes;

    const { ThemeStore } = require("@webpack/common/stores") as typeof import("@webpack/common/stores");

    const activeTheme = ThemeStore == null
        ? undefined
        : ThemeStore.theme === "light" ? "light" : "dark";

    const links = new Set<string>();

    if (onlineThemesEnabled) {
        for (const rawLink of onlineThemes) {
            if (rawLink.enabled !== true) continue;

            const match = /^@(light|dark) (.*)/.exec(rawLink.name);
            const link = match?.[2] ?? rawLink.name;
            const mode = rawLink.themeActivationModes ?? "always";

            if (shouldApplyTheme(mode, activeTheme)) {
                links.add(link);
            }
        }
    }

    const missing = new Set<string>();

    if (IS_WEB) {
        for (const theme of localThemes) {
            if (theme.enabled === false) continue;
            if (!shouldApplyTheme(theme.themeActivationModes ?? "always", activeTheme)) continue;

            try {
                const themeData = await VelocityNative.themes.getThemeData(theme.name);
                if (!themeData) throw new Error();
                const blob = new Blob([themeData], { type: "text/css" });
                links.add(URL.createObjectURL(blob));
            } catch {
                missing.add(theme.name);
            }
        }
    } else {
        for (const theme of localThemes) {
            if (theme.enabled === false) continue;
            if (!shouldApplyTheme(theme.themeActivationModes ?? "always", activeTheme)) continue;

            try {
                await VelocityNative.themes.getThemeData(theme.name);
            } catch {
                missing.add(theme.name);
                continue;
            }

            if (!themeVersions.has(theme.name)) {
                themeVersions.set(theme.name, Date.now());
            }

            links.add(`velocity:///themes/${theme.name}?v=${themeVersions.get(theme.name)}`);
        }
    }

    if (missing.size > 0) {
        const plain = JSON.parse(JSON.stringify(Settings.themes));
        plain.localThemes = plain.localThemes.filter((t: { name: string; }) => !missing.has(t.name));
        Settings.themes = plain;
    }

    const newContent = Array.from(links).map(link => `@import url("${link.trim()}");`).join("\n");

    if (themesStyle.textContent === newContent) return;

    themesStyle.textContent = newContent;
    updatePopoutWindows();
}

function applyToPopout(popoutWindow: Window | undefined, key: string) {
    if (!popoutWindow?.document) return;
    // skip game overlay cuz it needs to stay transparent, themes broke it
    if (key === "DISCORD_OutOfProcessOverlay") return;

    const doc = popoutWindow.document;

    doc.querySelector("velocity-root")?.remove();

    const clonedRoot = velocityRootNode.cloneNode(false) as HTMLElement;

    clonedRoot.append(
        coreStyleRootNode.cloneNode(true),
        managedStyleRootNode.cloneNode(true)
    );

    if (key !== "DISCORD_OutOfProcessOverlay") {
        clonedRoot.append(userStyleRootNode.cloneNode(true));
    }

    doc.documentElement.appendChild(clonedRoot);
}

function updatePopoutWindows() {
    if (!PopoutWindowStore) return;

    for (const key of PopoutWindowStore.getWindowKeys()) {
        applyToPopout(PopoutWindowStore.getWindow(key), key);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (IS_USERSCRIPT) return;

    initThemes();

    toggle(Settings.useQuickCss);
    SettingsStore.addChangeListener("useQuickCss", toggle);

    SettingsStore.addChangeListener("themes.onlineThemesEnabled", rebuildThemes);
    SettingsStore.addChangeListener("themes.localThemes", rebuildThemes);
    SettingsStore.addChangeListener("themes.onlineThemes", rebuildThemes);

    window.addEventListener("message", event => {
        const { discordPopoutEvent } = event.data || {};
        if (discordPopoutEvent?.type !== "loaded") return;

        applyToPopout(PopoutWindowStore.getWindow(discordPopoutEvent.key), discordPopoutEvent.key);
    });

    if (!IS_WEB) {
        VelocityNative.quickCss.addThemeChangeListener(() => {
            themeVersions.clear(); // bust all versions on theme file change
            rebuildThemes();
        });
    }
}, { once: true });

export function initQuickCssThemeStore(themeStore: ThemeStore) {
    if (IS_USERSCRIPT) return;

    rebuildThemes();

    let currentTheme = themeStore.theme;
    themeStore.addChangeListener(() => {
        if (currentTheme === themeStore.theme) return;

        currentTheme = themeStore.theme;
        rebuildThemes();
    });
}
