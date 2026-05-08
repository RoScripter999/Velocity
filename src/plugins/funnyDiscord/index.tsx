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

import { gitHash } from "@shared/userAgent";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

import { MiddleFinger } from "./components/loadingScreen";
import getIntlMessage from "./messages";

export default definePlugin({
    name: "FunnyDiscord",
    description: "Makes the discord funnier",
    authors: [Devs.RoScripter999],
    enabledByDefault: true,

    MiddleFinger,
    getIntlMessage,

    patches: [
        {
            find: "#{intl::LOADING_DID_YOU_KNOW}",
            lazy: true,
            replacement: {
                // the MATCH could be better idk i suck at regex
                // but Discord never changed this ui for like a decade now except the variables
                match: /\(\s*0,\s*\w+\.jsx\)\(\s*\w+\.A\s*,\s*\{[^}]*setRef\s*:\s*this\.setVideoRef[^}]*?\}\)/,
                replace: "$self.MiddleFinger()"
            }
        },
        {
            find: ["#{intl::SETTINGS_NOTICE_MESSAGE}", '"data-emphasized"'],
            lazy: true,
            replacement: {
                match: /\i.intl\.string\([^)]*#{intl::SETTINGS_NOTICE_MESSAGE}\)/,
                replace: "$self.getIntlMessage('MODS_EAT_YOU')"
            }
        },

        {
            find: "#{intl::USER_SETTINGS_CUSTOMIZE_PROFILE_EXAMPLE_BUTTON}",
            replacement: {
                match: /\w+\.intl\.string\([^)]*#{intl::USER_SETTINGS_CUSTOMIZE_PROFILE_EXAMPLE_BUTTON}\)/,
                replace: "$self.getIntlMessage('I_AM_USELESS')"
            }
        },
        {
            find: "#{intl::SWITCH_ACCOUNTS_MODAL_SUBHEADER}",
            lazy: true,
            replacement: {
                match: /\w+\.intl\.string\([^)]*#{intl::SWITCH_ACCOUNTS_MODAL_SUBHEADER}\)/,
                replace: "$self.getIntlMessage('SIGN_IN_SIGN_OUT_NEVER_COME_BACK')"
            }
        },
        {
            find: "#{intl::APPLICATION_ENTITLEMENT_CODE_REDEMPTION_PROMPT}",
            lazy: true,
            replacement: {
                match: /\w+\.intl\.string\([^)]*#{intl::APPLICATION_ENTITLEMENT_CODE_REDEMPTION_PROMPT}\)/,
                replace: "$self.getIntlMessage('CODE_REDEMPTION_STEAL_DATA')"
            }
        },
        {
            find: "Need help? Check out our ",
            replacement: {
                match: /(troubleshooting guide)/,
                replace: "$1 that won\\'t help you"
            }
        },
        {
            find: ".BILLING_TRANSACTION_HISTORY_CATEGORY,",
            lazy: true,
            replacement: {
                match: /(BILLING_TRANSACTION_HISTORY_CATEGORY[^}]*useTitle:\(\)=>)\w+\.intl\.string\(\w+\.\w+\.\w+\)/,
                replace: '$1"Credit Card Steal History"'
            }
        }

    ],

    get gitHash() {
        return gitHash;
    }
});
