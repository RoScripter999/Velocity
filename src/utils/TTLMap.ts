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

/**
 * A Map whose entries expire after a given amount of time. When an entry expires, it is automatically removed from the map and an optional callback is called.
 */
export class TTLMap<K, V> extends Map<K, V> {
    private readonly _timers = new Map<K, NodeJS.Timeout>();

    public constructor(public readonly expiryMs: number, private readonly onExpire?: (key: K, value: V) => void) {
        super();
    }

    public set(key: K, value: V) {
        if (this._timers.has(key)) {
            clearTimeout(this._timers.get(key));
        }

        const timeoutId = setTimeout(() => {
            this.delete(key);
            this.onExpire?.(key, value);
        }, this.expiryMs);
        this._timers.set(key, timeoutId);

        return super.set(key, value);
    }

    public delete(key: K) {
        if (this._timers.has(key)) {
            clearTimeout(this._timers.get(key));
            this._timers.delete(key);
        }

        return super.delete(key);
    }

    clear(): void {
        for (const timeoutId of this._timers.values())
            clearTimeout(timeoutId);

        this._timers.clear();
        return super.clear();
    }
}
