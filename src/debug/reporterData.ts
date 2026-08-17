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
 * this file is needed to avoid an import of plugins in ./runReporter.ts
 */
import type { Patch } from "@utils/types";
import type { TypeWebpackSearchHistory } from "@webpack";

interface EvaledPatch extends Patch {
    id: PropertyKey;
}
interface ErroredPatch extends EvaledPatch {
    oldModule: string,
    newModule: string;
}
export interface ReporterData {
    failedPatches: {
        foundNoModule: Patch[];
        hadNoEffect: EvaledPatch[];
        undoingPatchGroup: EvaledPatch[];
        erroredPatch: ErroredPatch[];
    };
    failedWebpack: Record<TypeWebpackSearchHistory, string[][]>;
}

export const reporterData: ReporterData = {
    failedPatches: {
        foundNoModule: [],
        hadNoEffect: [],
        undoingPatchGroup: [],
        erroredPatch: []
    },
    failedWebpack: {
        find: [],
        findByProps: [],
        findByCode: [],
        findStore: [],
        findCssClasses: [],
        findComponent: [],
        findComponentByCode: [],
        findExportedComponent: [],
        waitFor: [],
        waitForComponent: [],
        waitForStore: [],
        proxyLazyWebpack: [],
        LazyComponentWebpack: [],
        extractAndLoadChunks: [],
        mapMangledModule: []
    }
};
