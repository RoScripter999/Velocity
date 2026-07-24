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
import { getUserSettingLazy } from "@api/UserSettings";
import ErrorBoundary from "@components/ErrorBoundary";
import { createIcon, Icon } from "@components/Icons";
import { openPluginModal } from "@components/settings";
import { Devs } from "@utils/constants";
import { classes } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy, findComponentByCodeLazy, findCssClassesLazy } from "@webpack";
import { ConnectedAccountsStore, Icons, Menu, Popout, useRef, useState, useStateFromStores } from "@webpack/common";

import managedStyle from "./style.css?managed";

// Same as StreamCrasher
const Button = findComponentByCodeLazy(".GREEN,positionKeyStemOverride:");
const Classes = findCssClassesLazy("audioButtonWithMenu", "audioButtonParent", "popoutOpen", "buttonChevron", "hasColorGlow");

const ShowCurrentGame = getUserSettingLazy<boolean>("status", "showCurrentGame")!;
const ConnectedAccountActions = findByPropsLazy("setShowActivity");

const settings = definePluginSettings({
    oldIcon: {
        type: OptionType.BOOLEAN,
        description: "Use the old icon style before Discord icon redesign",
        default: false
    }
});

function ActivityToggleIcon(showCurrentGame?: boolean, oldIcon?: boolean) {
    const redLinePath = !oldIcon
        ? "M22.7 2.7a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4Z"
        : "M23 2.27 21.73 1 1 21.73 2.27 23 23 2.27Z";

    const maskBlackPath = !oldIcon
        ? "M23.27 4.73 19.27 .73 -.27 20.27 3.73 24.27Z"
        : "M23.27 4.54 19.46.73 .73 19.46 4.54 23.27 23.27 4.54Z";

    return createIcon(props => (
        <Icon {...props}>
            <path
                fill={!showCurrentGame && !oldIcon ? "var(--icon-voice-muted)" : "currentColor"}
                mask={!showCurrentGame ? "url(#gameActivityMask)" : void 0}
                d="M3.06 20.4q-1.53 0-2.37-1.065T.06 16.74l1.26-9q.27-1.8 1.605-2.97T6.06 3.6h11.88q1.8 0 3.135 1.17t1.605 2.97l1.26 9q.21 1.53-.63 2.595T20.94 20.4q-.63 0-1.17-.225T18.78 19.5l-2.7-2.7H7.92l-2.7 2.7q-.45.45-.99.675t-1.17.225Zm14.94-7.2q.51 0 .855-.345T19.2 12q0-.51-.345-.855T18 10.8q-.51 0-.855.345T16.8 12q0 .51.345 .855T18 13.2Zm-2.4-3.6q.51 0 .855-.345T16.8 8.4q0-.51-.345-.855T15.6 7.2q-.51 0-.855.345T14.4 8.4q0 .51.345 .855T15.6 9.6ZM6.9 13.2h1.8v-2.1h2.1v-1.8h-2.1v-2.1h-1.8v2.1h-2.1v1.8h2.1v2.1Z"
            />
            {!showCurrentGame && <>
                <path fill="var(--icon-voice-muted)" d={redLinePath} />
                <mask id="gameActivityMask">
                    <rect fill="white" x="0" y="0" width="24" height="24" />
                    <path fill="black" d={maskBlackPath} />
                </mask>
            </>}
        </Icon>
    ));
}

const ChevronIcon = ({ showCurrentGame, isShown }) => (
    <Icon width="15" height="15" style={{ transform: isShown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
        <path fill={!showCurrentGame ? "var(--icon-voice-muted)" : "currentColor"} d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z" />
    </Icon>
);

function ActivityContextMenu({ closePopout }) {
    const showCurrentGame = ShowCurrentGame.useSetting();

    const connectedAccounts = useStateFromStores([ConnectedAccountsStore], () => ConnectedAccountsStore.getAccounts());
    const spotifyAccounts = connectedAccounts.filter(account => account.type === "spotify" && !account.revoked);

    const spotifyAccount = spotifyAccounts[0];
    // The update is an API request which takes a bit to update the store, so we have to use our own state to reflect the change immediately
    const [shareSpotifyActivity, setShareSpotifyActivity] = useState(spotifyAccount?.showActivity ?? false);

    return (
        <Menu.Menu navId="game-activity-options" onClose={closePopout}>
            <Menu.MenuCheckboxItem
                id="game-activity-context-toggle"
                label={showCurrentGame ? "Disable Game Activity" : "Enable Game Activity"}
                checked={!showCurrentGame}
                action={() => ShowCurrentGame.updateSetting(old => !old)}
            />
            {spotifyAccounts.length === 1 && <Menu.MenuCheckboxItem
                id="vc-toggle-spotify"
                label="Share Spotify Activity"
                checked={shareSpotifyActivity}
                action={async () => {
                    ConnectedAccountActions.setShowActivity(spotifyAccount.type, spotifyAccount.id, !shareSpotifyActivity);
                    setShareSpotifyActivity(!shareSpotifyActivity);
                }}
            />}
            <Menu.MenuSeparator />
            <Menu.MenuItem
                id="game-activity-context-settings"
                label="Activity Settings"
                icon={Icons.SettingsIcon}
                leadingAccessory={{ type: "icon", icon: Icons.SettingsIcon }}
                action={() => openPluginModal(Velocity.Plugins.plugins.GameActivityToggle)}
            />
        </Menu.Menu>
    );
}

function GameActivityToggleButton(props: { nameplate?: any; }) {
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const showCurrentGame = ShowCurrentGame.useSetting();
    const { oldIcon } = settings.use(["oldIcon"]);

    return (
        <Popout
            position="top"
            align="left"
            animation={Popout.Animation.FADE}
            spacing={4}
            targetElementRef={buttonRef}
            renderPopout={({ closePopout }) => <ActivityContextMenu closePopout={closePopout} />}
        >
            {({ onClick: openPopout }, { isShown }) => (
                <div
                    ref={buttonRef}
                    className={classes(Classes.audioButtonParent, !showCurrentGame && Classes.hasColorGlow, isShown && Classes.popoutOpen)}
                >
                    <Button
                        aria-checked={!showCurrentGame}
                        aria-label={showCurrentGame ? "Disable Game Activity" : "Enable Game Activity"}
                        className={Classes.audioButtonWithMenu}
                        icon={ActivityToggleIcon(showCurrentGame, oldIcon)}
                        onClick={() => ShowCurrentGame.updateSetting(old => !old)}
                        onContextMenu={openPopout}
                        plated={props.nameplate != null}
                        redGlow={!showCurrentGame}
                        role="switch"
                        tooltipShouldShow={!isShown}
                        tooltipText={showCurrentGame ? "Disable Game Activity" : "Enable Game Activity"}
                    />
                    <Button
                        aria-label="Activity Options"
                        className={classes(Classes.buttonChevron, isShown && Classes.popoutOpen)}
                        icon={() => <ChevronIcon showCurrentGame={showCurrentGame} isShown={isShown} />}
                        onClick={openPopout}
                        onContextMenu={openPopout}
                        plated={props.nameplate != null}
                        redGlow={!showCurrentGame}
                        tooltipShouldShow={!isShown}
                        tooltipText="Activity Options"
                    />
                </div>
            )}
        </Popout>
    );
}

export default definePlugin({
    name: "GameActivityToggle",
    description: "Adds a button next to the mic and deafen button to toggle game activity.",
    tags: ["Activity", "Shortcuts"],
    authors: [Devs.Nuckyz, Devs.RuukuLada],
    dependencies: ["UserSettingsAPI"],
    settings,

    managedStyle,

    patches: [{
        find: "#{intl::USER_PROFILE_ACCOUNT_POPOUT_BUTTON_A11Y_LABEL}",
        replacement: {
            match: /children:\[(?=.{0,25}?accountContainerRef)/,
            replace: "children:[$self.GameActivityToggleButton(arguments[0]),"
        }
    }],

    GameActivityToggleButton: ErrorBoundary.wrap(GameActivityToggleButton, { noop: true })
});
