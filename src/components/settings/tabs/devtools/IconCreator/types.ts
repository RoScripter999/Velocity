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

export type SvgRule = "evenodd" | "nonzero";

interface SvgBase {
    fill: string;
    fillRule?: SvgRule;
    clipRule?: SvgRule;
}

export interface SvgPathElement extends SvgBase {
    type: "path";
    d: string;
}

export interface SvgCircleElement extends SvgBase {
    type: "circle";
    cx: string;
    cy: string;
    r: string;
}

export interface SvgPolygonElement extends SvgBase {
    type: "polygon";
    points: string;
}

export type SvgElement = SvgPathElement | SvgCircleElement | SvgPolygonElement;
