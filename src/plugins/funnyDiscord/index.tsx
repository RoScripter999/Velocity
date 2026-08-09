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

import { gitHash } from "@shared/userAgent";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { i18n } from "@webpack/common";

import { MiddleFinger } from "./components/loadingScreen";
import MessageMap from "./messages.json";

function vcIntlMessage(key: keyof typeof MessageMap) {
    const entry = MessageMap[key];
    const locale = i18n.intl.currentLocale as keyof typeof entry;

    return entry[locale] ?? entry["en-US"] ?? key;
}

export default definePlugin({
    name: "FunnyDiscord",
    description: "Makes the discord funnier (beware of the jokes!!!)",
    authors: [Devs.RoScripter999],
    enabledByDefault: true,

    MiddleFinger,
    vcIntlMessage,

    patches: [
        {
            find: "#{intl::LOADING_DID_YOU_KNOW}",
            lazy: true,
            replacement: {
                // the MATCH could be better idk i suck at regex
                // but Discord never changed this ui for like a decade now except the variables
                match: /\(0,\i\.jsx\)\(\i\.\i,\{.{0,50}setRef:this\.setVideoRef.{0,100}\}\)/,
                replace: "$self.MiddleFinger()"
            }
        },
        {
            find: "#{intl::SETTINGS_NOTICE_MESSAGE})})}),",
            lazy: true,
            replacement: {
                match: /\i.intl\.string\([^)]*#{intl::SETTINGS_NOTICE_MESSAGE}\)/,
                replace: "$self.vcIntlMessage('MODS_EAT_YOU')"
            }
        },

        {
            find: "#{intl::USER_SETTINGS_CUSTOMIZE_PROFILE_EXAMPLE_BUTTON}",
            replacement: {
                match: /\w+\.intl\.string\([^)]*#{intl::USER_SETTINGS_CUSTOMIZE_PROFILE_EXAMPLE_BUTTON}\)/,
                replace: "$self.vcIntlMessage('I_AM_USELESS')"
            }
        },
        {
            find: "#{intl::SWITCH_ACCOUNTS_MODAL_SUBHEADER}",
            lazy: true,
            replacement: {
                match: /\w+\.intl\.string\([^)]*#{intl::SWITCH_ACCOUNTS_MODAL_SUBHEADER}\)/,
                replace: "$self.vcIntlMessage('SIGN_IN_SIGN_OUT_NEVER_COME_BACK')"
            }
        },
        {
            find: "#{intl::APPLICATION_ENTITLEMENT_CODE_REDEMPTION_PROMPT}",
            lazy: true,
            replacement: {
                match: /\w+\.intl\.string\([^)]*#{intl::APPLICATION_ENTITLEMENT_CODE_REDEMPTION_PROMPT}\)/,
                replace: "$self.vcIntlMessage('CODE_REDEMPTION_STEAL_DATA')"
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
                replace: '$1$self.vcIntlMessage("CREDIT_CARD_STEAL_HISTORY")'
            }
        }
    ],

    get gitHash() {
        return gitHash;
    }
});
