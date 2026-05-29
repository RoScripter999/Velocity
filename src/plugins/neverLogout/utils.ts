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

import { get, set } from "@api/DataStore";
import { findByPropsLazy } from "@webpack";

export const { loginToken } = findByPropsLazy("loginToken", "switchAccountToken");

export const KEY = "NeverLogout";

interface UserData {
    token: string;
    tokenInvalid?: boolean;
    userInfo: {
        username: string;
        avatar: { src: string; decoration?: string; };
    };
}

export async function getSavedTokens() {
    try {
        const tokens = await get<Record<string, UserData>>(KEY);
        return tokens || {};
    } catch {
        return {};
    }
}

export async function saveToken(userId: string, token: string, username: string, avatar: { src: string; decoration?: string; }) {
    const tokens = await getSavedTokens();
    tokens[userId] = { token, userInfo: { username, avatar } };
    await set(KEY, tokens);
}

export async function removeUser(userId: string) {
    const tokens = await getSavedTokens();
    delete tokens[userId];
    await set(KEY, tokens);
}

export async function autoLogin(userId?: string) {
    try {
        const tokens = await getSavedTokens();
        const targetToken = userId ? tokens[userId]?.token : Object.values(tokens)[0]?.token;

        if (targetToken) {
            loginToken(targetToken);
            return targetToken;
        }
    } catch { }
    return null;
}
