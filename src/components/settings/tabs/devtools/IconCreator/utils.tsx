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

import type { SvgElement } from "./types";

export const makeEmptySvg = (): SvgElement => ({
    type: "path",
    d: "",
    fill: ""
});

export function getSvgPrimaryValue(svg: SvgElement): string {
    switch (svg.type) {
        case "path": return svg.d;
        case "circle": return svg.r;
        case "polygon": return svg.points;
        default: return "";
    }
}

export function setSvgPrimaryValue(svg: SvgElement, value: string): SvgElement {
    switch (svg.type) {
        case "path": return { ...svg, d: value };
        case "circle": return { ...svg, r: value };
        case "polygon": return { ...svg, points: value };
        default: return svg;
    }
}

export function validateSvg(svg: SvgElement): string | null {
    const value = getSvgPrimaryValue(svg).trim();
    if (!value) return `${svg.type.charAt(0).toUpperCase() + svg.type.slice(1)} data is required`;

    try {
        if (svg.type === "path") {
            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", value);
            if (pathEl.getTotalLength() === 0) return "Invalid path data";
        } else if (svg.type === "circle") {
            if (Number.isNaN(Number(value))) return "Invalid radius";
        } else if (svg.type === "polygon") {
            const pointPairs = value.split(/\s+/);
            for (const pair of pointPairs) {
                const [x, y, ...rest] = pair.split(",");
                if (rest.length > 0 || Number.isNaN(Number(x)) || Number.isNaN(Number(y))) {
                    return "Invalid points format";
                }
            }
        }
        return null;
    } catch {
        return "Invalid SVG data";
    }
}

export function renderElement(svg: SvgElement, index: number) {
    const props: any = {
        key: index,
        fill: svg.fill || undefined,
        fillRule: svg.fillRule || undefined,
        clipRule: svg.clipRule || undefined
    };

    switch (svg.type) {
        case "path":
            return <path {...props} d={svg.d} />;
        case "circle":
            return <circle {...props} cx={svg.cx} cy={svg.cy} r={svg.r} />;
        case "polygon":
            return <polygon {...props} points={svg.points} />;
        default:
            return null;
    }
}

export function generateCode(svgs: SvgElement[], width: string, height: string, viewBox: string): string {
    const elements = svgs.map(p => {
        const attrs = [
            `fill="${p.fill || "currentColor"}"`,
            p.fillRule && `fillRule="${p.fillRule}"`,
            p.clipRule && `clipRule="${p.clipRule}"`
        ].filter(Boolean).join(" ");

        switch (p.type) {
            case "path": return `<path d="${p.d}" ${attrs} />`;
            case "circle": return `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" ${attrs} />`;
            case "polygon": return `<polygon points="${p.points}" ${attrs} />`;
            default: return "";
        }
    }).join("\n            ");

    const extraProps = [
        width !== "24" && `width="${width}"`,
        height !== "24" && `height="${height}"`,
        viewBox !== "0 0 24 24" && `viewBox="${viewBox}"`
    ].filter(Boolean).map(p => `\n            ${p}`).join("");

    return `export const CustomIcon = createIcon((props: IconProps) => (
    <Icon${extraProps ? `       ${extraProps.trim()}` : ""} {...props}>
        ${elements}
    </Icon>
));`;
}

export function normalizeSvgByType(previous: SvgElement, nextType: SvgElement["type"]): SvgElement {
    const base = {
        fill: previous.fill ?? "",
        fillRule: previous.fillRule,
        clipRule: previous.clipRule
    };

    switch (nextType) {
        case "path":
            return { ...base, type: "path", d: previous.type === "path" ? previous.d : "" };
        case "circle":
            return {
                ...base,
                type: "circle",
                cx: previous.type === "circle" ? previous.cx : "12",
                cy: previous.type === "circle" ? previous.cy : "12",
                r: previous.type === "circle" ? previous.r : ""
            };
        case "polygon":
            return { ...base, type: "polygon", points: previous.type === "polygon" ? previous.points : "" };
    }
}
