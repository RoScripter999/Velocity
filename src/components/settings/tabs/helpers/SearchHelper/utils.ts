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

import { Logger } from "@utils/Logger";
import type { ModuleFactory } from "@velocity-types/webpack";
import { cache, filters, wreq } from "@webpack";

export interface SearchResult {
    id: PropertyKey;
    factory: ModuleFactory;
}

const logger = new Logger("SearchHelper");

export function findByModuleId(moduleId: string): SearchResult | null {
    const factory = wreq.m[moduleId];
    return factory != null ? { id: moduleId, factory } : null;
}

export function findByCode(queries: string[]): SearchResult[] {
    if (!queries.length) return [];

    const matches: SearchResult[] = [];
    const filterFns = queries.map(q => filters.byCode(q));

    for (const id in wreq.m) {
        const factory = wreq.m[id];

        try {
            if (filterFns.every(fn => fn(factory))) {
                matches.push({ id, factory });
            }
        } catch { }
    }

    return matches;
}

export function findByProps(queries: string[]): SearchResult[] {
    if (!queries.length) return [];

    const filterFns = queries.map(q => filters.byProps(q));
    return searchExports(filterFns);
}

export function findByComponentCode(queries: string[]): SearchResult[] {
    if (!queries.length) return [];

    const filterFns = queries.map(q => filters.componentByCode(q));
    return searchExports(filterFns);
}

function searchExports(filterFns: ((mod: any) => boolean)[]): SearchResult[] {
    if (!filterFns.length) return [];

    const matches: SearchResult[] = [];

    for (const id in cache) {
        const mod = cache[id];
        if (!mod?.loaded || mod.exports == null) continue;

        try {
            if (filterFns.every(fn => fn(mod.exports))) {
                matches.push({ id, factory: wreq.m[id] });
                continue;
            }

            if (typeof mod.exports !== "object") continue;

            for (const key in mod.exports) {
                const nested = mod.exports[key];
                if (nested && filterFns.every(fn => fn(nested))) {
                    matches.push({ id, factory: wreq.m[id] });
                    break;
                }
            }
        } catch { }
    }

    return matches;
}

export function logModules(matches: SearchResult[]) {
    if (!matches.length) return;
    logger.log(`Found ${matches.length} module(s):`, matches.map(m => m.factory));
}
