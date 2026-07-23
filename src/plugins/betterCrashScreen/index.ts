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

import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import CrashMenu from "./CrashMenu";

export default definePlugin({
    name: "BetterCrashScreen",
    description: "Improves the react crash screen menu",
    authors: [Devs.RoScripter999],
    enabledByDefault: true,

    CrashMenu: ErrorBoundary.wrap(CrashMenu, { noop: true }),

    patches: [{
        find: "#{intl::ERRORS_ACTION_TO_TAKE}",
        replacement: {
            match: /(?<=render\(\)\s*\{\s*let\s*\{\s*children\s*:\s*\w+\s*,\s*renderCustomMessage\s*:\s*\w+\s*\}\s*=\s*this\.props\s*;)/,
            replace: "if(null!==this.state.error){return $self.CrashMenu({ error: this.state.error })}"
        }
    }]
});
