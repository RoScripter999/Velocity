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

import { Settings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import { AuthenticationStore } from "@webpack/common";

import gitHash from "~git-hash";

const logger = new Logger("Analytics");

interface AnalyticsError {
    message: string;
}

interface VersionInfo {
    velocityVersion: string;
    velocityGitHash: string;
    discordReleaseChannel: string;
    discordBuildNumber: number;
}

export type AnalyticsPayload =
    | { type: "READY"; token: string; timestamp: number; }
    | { type: "ERROR"; token: string; errors: Array<{ message: string; }>; version: VersionInfo; };

let ready = false;
const pending: AnalyticsError[][] = [];
const errorBuffer: AnalyticsError[] = [];

function getToken(): string | null {
    // token seg: userid.timestamp.randomhash
    const token = AuthenticationStore.getToken();
    if (!token) {
        logger.error("Failed to retrieve token");
        return null;
    }

    return token;
}

export function initAnalytics() {
    if (Settings.analyticsEnabled) {
        const tk = getToken();
        if (!tk) return;

        VelocityNative.native.sendAnalytics({
            type: "READY",
            token: tk,
            timestamp: Date.now()
        }).catch(err => logger.error("Failed to send analytics", err));
    }

    ready = true;
    for (const errors of pending) report_error(errors);
    pending.length = 0;

    setInterval(() => {
        if (errorBuffer.length === 0) return;
        if (!Settings.analyticsEnabled) { errorBuffer.length = 0; return; }

        const errors = errorBuffer.splice(0, errorBuffer.length);

        const tk = getToken();
        if (!tk) return;

        VelocityNative.native.sendAnalytics({
            type: "ERROR",
            token: tk,
            errors,
            version: {
                velocityVersion: VERSION,
                velocityGitHash: gitHash,
                discordReleaseChannel: window.GLOBAL_ENV.RELEASE_CHANNEL,
                discordBuildNumber: window.GLOBAL_ENV.BUILD_NUMBER ?? -1
            }
        }).catch(err => logger.error("Failed to send analytics", err));
    }, 5 * 60 * 1000);
}


function report_error(errors: AnalyticsError[]) {
    if (!ready) {
        pending.push(errors);
        return;
    }
    if (!Settings.analyticsEnabled) return;

    errorBuffer.push(...errors);
}

export function reportAnalyticsError(message: string) {
    report_error([{ message }]);
}
