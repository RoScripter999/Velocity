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

import { Devs } from "@utils/constants";
import definePlugin, { StartAt } from "@utils/types";
import { setColorPicker, setCreateScroller, setFilePicker, setIcons, setRoleMemberPopout } from "@webpack/common";

export default definePlugin({
    name: "ConcatenatedComponentExtractor",
    description: "Extract components that have been concatenated by the bundler or patch fixes",
    authors: [Devs.sadan],
    startAt: StartAt.Init,
    required: true,

    patches: [
        {
            find: "#{intl::USER_SETTINGS_PROFILE_COLOR_SELECT_COLOR}),focusProps:",
            lazy: true,
            replacement: {
                match: /(?=function (\i)\(\i\)\{let\{onChange:\i,onClose:\i,[^}]+?showEyeDropper:)/,
                replace: "$self.setColorPicker($1);"
            }
        },
        {
            find: /="ltr",orientation:\i="vertical"[^}]+?customTheme:/,
            replacement: {
                match: /(function (\i)\(\i,\i,\i\)\{.+?return \i\.forwardRef\()/,
                replace: "$self.setCreateScroller($2);$1"
            }
        },
        {
            find: ",PiggyBankIcon:()=>",
            replacement: {
                match: /\i\.\i\((\i),\{[\s\S]*?\}\)/,
                replace: "$&,$self.setIcons($1)"
            }
        },
        {
            find: ".currentTarget.files?.[0])",
            lazy: true,
            replacement: {
                match: /(?=function (\i)\(\i\)\{let\{filename:\i,className:\i,filters:\i,)/,
                replace: "$self.setFilePicker($1);"
            }
        },
        {
            find: ".ROLE_MENTION)",
            replacement: {
                match: /function (\i)(?=.+?renderPopout:.{0,20}\1,\{guildId:\i,channelId:\i)/,
                replace: "$self.setRoleMemberPopout($1);$&"
            }
        },

        {
            find: "interactiveLabel:!0,",
            replacement: {
                match: /(onChange:\s*\w+,?\s*)hasIcon:\s*(\w+)/,
                replace: "$1hasIcon:$self.showRedesignedIcon||$2"
            }
        },
        {
            find: ",actionBarInputLayout:",
            replacement: {
                match: /actionsFullWidth:null==(\i)/,
                replace: "actionsFullWidth:arguments[0].actionsFullWidth??null==$1"
            }
        }
    ],

    get showRedesignedIcon() {
        return Velocity.Settings.velocityStyles.showRedesignedIcon;
    },

    setRoleMemberPopout,
    setCreateScroller,
    setColorPicker,
    setFilePicker,
    setIcons
});
