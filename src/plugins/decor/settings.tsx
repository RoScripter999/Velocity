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

import { definePluginSettings } from "@api/Settings";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { classes } from "@utils/misc";
import { OptionType } from "@utils/types";
import { Buttons, SettingsRouter } from "@webpack/common";

import DecorPlugin from ".";
import DecorSection from "./ui/components/DecorSection";

export const settings = definePluginSettings({
    changeDecoration: {
        type: OptionType.COMPONENT,
        component({ closePluginSettings }) {
            if (!DecorPlugin.started) return <Paragraph>
                Enable Decor and restart your client to change your avatar decoration.
            </Paragraph>;

            return <div>
                <DecorSection hideTitle hideDivider noMargin />
                <Paragraph className={classes(Margins.top8, Margins.bottom8)}>
                    You can also access Decor decorations from the <Buttons.TextButton
                        text="Profiles"
                        onClick={() => {
                            closePluginSettings();
                            SettingsRouter.openUserSettings("profile_panel");
                        }}
                    /> page.
                </Paragraph>
            </div>;
        }
    },
    agreedToGuidelines: {
        type: OptionType.BOOLEAN,
        description: "Agreed to guidelines",
        hidden: true,
        default: false
    }
});
