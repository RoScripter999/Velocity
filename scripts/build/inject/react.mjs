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

export const VelocityFragment = /* #__PURE__*/ Symbol.for("react.fragment");
export let VelocityCreateElement = (...args) => {
    const createElement = Velocity.Webpack.Common.React.createElement;
    VelocityCreateElement = (type, props, ...children) => {
        if (typeof type === "function" && type.__velocitySettingsFactory) {
            const flat = children.flat();
            return type({ ...(props ?? {}), children: flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat });
        }
        return createElement(type, props, ...children);
    };
    return VelocityCreateElement(...args);
};
