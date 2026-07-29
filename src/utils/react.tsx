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

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "@webpack/common";
import type { ActionDispatch, DependencyList, ReactNode } from "react";

import { checkIntersecting } from "./misc";

export * from "./lazyReact";

export const NoopComponent = () => null;
const USEMAPS_SYM = Symbol("react.useMaps");
const USEMAPS_ORIGINALS_SYM = Symbol("react.useMaps.originals");

/**
 * Check if a React node is a primitive (string, number, bigint, boolean, undefined)
 */
export function isPrimitiveReactNode(node: ReactNode): boolean {
    const t = typeof node;
    return t === "string" || t === "number" || t === "bigint" || t === "boolean" || t === "undefined";
}

/**
 * Check if an element is on screen
 * @param intersectOnly If `true`, will only update the state when the element comes into view
 * @returns [refCallback, isIntersecting]
 */
export const useIntersection = (intersectOnly = false): [
    refCallback: React.RefCallback<Element>,
    isIntersecting: boolean,
] => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [isIntersecting, setIntersecting] = useState(false);

    const refCallback = (element: Element | null) => {
        observerRef.current?.disconnect();
        observerRef.current = null;

        if (!element) return;

        if (checkIntersecting(element)) {
            setIntersecting(true);
            if (intersectOnly) return;
        }

        observerRef.current = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== element) continue;
                if (entry.isIntersecting && intersectOnly) {
                    setIntersecting(true);
                    observerRef.current?.disconnect();
                    observerRef.current = null;
                } else {
                    setIntersecting(entry.isIntersecting);
                }
            }
        });
        observerRef.current.observe(element);
    };

    return [refCallback, isIntersecting];
};

type AwaiterRes<T> = [T, any, boolean];
interface AwaiterOpts<T> {
    fallbackValue: T;
    deps?: unknown[];
    onError?(e: any): void;
    onSuccess?(value: T): void;
}
/**
 * Await a promise
 * @param factory Factory
 * @param fallbackValue The fallback value that will be used until the promise resolved
 * @returns [value, error, isPending]
 */
export function useAwaiter<T>(factory: () => Promise<T>): AwaiterRes<T | null>;
export function useAwaiter<T>(factory: () => Promise<T>, providedOpts: AwaiterOpts<T>): AwaiterRes<T>;
export function useAwaiter<T>(factory: () => Promise<T>, providedOpts?: AwaiterOpts<T | null>): AwaiterRes<T | null> {
    const opts: Required<AwaiterOpts<T | null>> = Object.assign({
        fallbackValue: null,
        deps: [],
        onError: null
    }, providedOpts);
    const [state, setState] = useState({
        value: opts.fallbackValue,
        error: null,
        pending: true
    });

    useEffect(() => {
        let isAlive = true;
        if (!state.pending) setState({ ...state, pending: true });

        factory()
            .then(value => {
                if (!isAlive) return;
                setState({ value, error: null, pending: false });
                opts.onSuccess?.(value);
            })
            .catch(error => {
                if (!isAlive) return;
                setState({ value: opts.fallbackValue, error, pending: false });
                opts.onError?.(error);
            });

        return () => void (isAlive = false);
    }, opts.deps);

    return [state.value, state.error, state.pending];
}

/**
 * Returns a function that can be used to force rerender react components
 */
export function useForceUpdater(): ActionDispatch<[]>;
export function useForceUpdater(withDep: true): [any, ActionDispatch<[]>];
export function useForceUpdater(withDep?: true) {
    const r = useReducer(x => x + 1, 0);
    return withDep ? r : r[1];
}

interface TimerOpts {
    interval?: number;
    deps?: unknown[];
}

export function useTimer({ interval = 1000, deps = [] }: TimerOpts) {
    const [time, setTime] = useState(0);
    const start = useMemo(() => Date.now(), deps);

    useEffect(() => {
        const intervalId = setInterval(() => setTime(Date.now() - start), interval);

        return () => {
            setTime(0);
            clearInterval(intervalId);
        };
    }, deps);

    return time;
}

type ObservableMap = Map<any, any> & {
    [USEMAPS_SYM]?: Set<() => void>;
    [USEMAPS_ORIGINALS_SYM]?: {
        set: Map<any, any>["set"];
        delete: Map<any, any>["delete"];
        clear: Map<any, any>["clear"];
    };
};

export function useMaps<T = any>(maps: Map<any, any>[], getValue: () => T): T {
    return useSyncExternalStore(useCallback((onStoreChange: () => void) => {
        maps.forEach((map: ObservableMap) => {
            if (!map[USEMAPS_SYM]) {
                map[USEMAPS_SYM] = new Set();

                const { set, delete: del, clear } = map;
                map[USEMAPS_ORIGINALS_SYM] = { set, delete: del, clear };

                map.set = function (...args) {
                    const res = set.apply(this, args);
                    map[USEMAPS_SYM]?.forEach(l => l());
                    return res;
                };

                map.delete = function (...args) {
                    const res = del.apply(this, args);
                    if (res) map[USEMAPS_SYM]?.forEach(l => l());
                    return res;
                };

                map.clear = function () {
                    clear.apply(this);
                    map[USEMAPS_SYM]?.forEach(l => l());
                };
            }

            map[USEMAPS_SYM].add(onStoreChange);
        });

        return () => {
            maps.forEach((map: ObservableMap) => {
                map[USEMAPS_SYM]?.delete(onStoreChange);
                if (map[USEMAPS_SYM]?.size) return;

                const originals = map[USEMAPS_ORIGINALS_SYM];
                if (originals) {
                    map.set = originals.set;
                    map.delete = originals.delete;
                    map.clear = originals.clear;
                }
                delete map[USEMAPS_SYM];
                delete map[USEMAPS_ORIGINALS_SYM];
            });
        };
    }, maps), getValue);
}

export function useCleanupEffect(
    effect: () => void,
    deps?: DependencyList
): void {
    useEffect(() => effect, deps);
}
