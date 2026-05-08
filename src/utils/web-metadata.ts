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

export let EXTENSION_VERSION: string;
export let EXTENSION_BASE_URL: string;
export let RENDERER_CSS_URL: string;

let resolveMetaReady: Function;
export const metaReady = new Promise<void>(res => resolveMetaReady = res);

if (IS_EXTENSION) {
    const listener = (e: MessageEvent) => {
        if (e.data?.type === "velocity:meta") {
            ({ EXTENSION_BASE_URL, EXTENSION_VERSION, RENDERER_CSS_URL } = e.data.meta);
            window.removeEventListener("message", listener);
            resolveMetaReady();
        }
    };

    window.addEventListener("message", listener);
}
