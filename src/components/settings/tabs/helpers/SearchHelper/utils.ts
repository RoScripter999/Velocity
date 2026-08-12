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

import type { ModuleFactory } from "@velocity-types/webpack";
import { filters, wreq } from "@webpack";

export interface SearchResult {
    id: string;
    factory: ModuleFactory;
}

function searchFactories(queries: string[]): SearchResult[] {
    const filterFns = queries.map(q => filters.byCode(q));
    const matches: SearchResult[] = [];
    for (const id in wreq.m) {
        try {
            if (filterFns.every(fn => fn(wreq.m[id]))) {
                matches.push({ id, factory: wreq.m[id] });
            }
        } catch { }
    }

    return matches;
}

function searchExports(filterFns: ((mod: any) => boolean)[]): SearchResult[] {
    const { c: cache } = wreq;
    const matches: SearchResult[] = [];

    for (const id in cache) {
        const mod = cache[id];
        if (!mod?.loaded || mod.exports == null) continue;

        try {
            if (filterFns.every(fn => fn(mod.exports))) { matches.push({ id, factory: wreq.m[id] }); continue; }
            if (typeof mod.exports !== "object") continue;

            for (const key in mod.exports) {
                const nested = mod.exports[key];
                if (nested && filterFns.every(fn => fn(nested))) { matches.push({ id, factory: wreq.m[id] }); break; }
            }
        } catch { }
    }

    return matches;
}

export const searchMethods = {
    findByCode: (queries: string[]) => searchFactories(queries),
    findByProps: (queries: string[]) => searchExports(queries.map(q => filters.byProps(q))),
    findComponentByCode: (queries: string[]) => searchExports(queries.map(q => filters.componentByCode(q))),
    findByModuleId: (queries: string[]): SearchResult[] => {
        const factory = wreq.m[queries[0]];
        return factory != null ? [{ id: queries[0], factory }] : [];
    }
};

export type SearchMethod = keyof typeof searchMethods;
