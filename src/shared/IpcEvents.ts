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

export const enum IpcEvents {
    INIT_FILE_WATCHERS = "VelocityInitFileWatchers",

    OPEN_QUICKCSS = "VelocityOpenQuickCss",
    GET_QUICK_CSS = "VelocityGetQuickCss",
    SET_QUICK_CSS = "VelocitySetQuickCss",
    QUICK_CSS_UPDATE = "VelocityQuickCssUpdate",

    GET_SETTINGS = "VelocityGetSettings",
    SET_SETTINGS = "VelocitySetSettings",

    GET_THEMES_LIST = "VelocityGetThemesList",
    GET_THEME_DATA = "VelocityGetThemeData",
    GET_THEME_SYSTEM_VALUES = "VelocityGetThemeSystemValues",
    GET_ONLINE_THEMES = "VelocityGetOnlineThemes",
    UPLOAD_THEME = "VelocityUploadTheme",
    DELETE_THEME = "VelocityDeleteTheme",
    THEME_UPDATE = "VelocityThemeUpdate",

    OPEN_EXTERNAL = "VelocityOpenExternal",
    OPEN_THEMES_FOLDER = "VelocityOpenThemesFolder",
    OPEN_SETTINGS_FOLDER = "VelocityOpenSettingsFolder",

    GET_UPDATES = "VelocityGetUpdates",
    GET_REPO = "VelocityGetRepo",
    UPDATE = "VelocityUpdate",
    BUILD = "VelocityBuild",

    OPEN_MONACO_EDITOR = "VelocityOpenMonacoEditor",
    GET_MONACO_THEME = "VelocityGetMonacoTheme",

    GET_PLUGIN_IPC_METHOD_MAP = "VelocityGetPluginIpcMethodMap",

    OPEN_IN_APP__RESOLVE_REDIRECT = "VelocityOIAResolveRedirect",
    VOICE_MESSAGES_READ_RECORDING = "VelocityVMReadRecording",

    CSP_IS_DOMAIN_ALLOWED = "VelocityCspIsDomainAllowed",
    CSP_REMOVE_OVERRIDE = "VelocityCspRemoveOverride",
    CSP_REQUEST_ADD_OVERRIDE = "VelocityCspRequestAddOverride",

    GET_RENDERER_CSS = "VelocityGetRendererCss",
    RENDERER_CSS_UPDATE = "VelocityRendererCssUpdate",
    PRELOAD_GET_RENDERER_JS = "VelocityPreloadGetRendererJs",

    SUPPORTS_WINDOWS_MATERIAL = "VelocitySupportsWindowsMaterial",
    OPEN_DEVTOOLS = "VelocityOpenDevTools",

    SET_TRAY_UPDATE_STATE = "VelocitySetTrayUpdateState",
    TRAY_REPAIR = "VelocityTrayRepair",
    TRAY_CHECK_UPDATES = "VelocityTrayCheckUpdates",
    TRAY_JOIN_SUPPORT_SERVER = "VelocityTrayJoinSupportServer",
}
