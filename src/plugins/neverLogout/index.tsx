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

import "./styles.css";

import ErrorBoundary from "@components/ErrorBoundary";
import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getIntlMessage } from "@utils/discord";
import { ManaModalContent, ManaModalHeader, type ManaModalProps, ManaModalRoot } from "@utils/manaModal";
import { openModal } from "@utils/modal";
import { useForceUpdater } from "@utils/react";
import definePlugin, { StartAt } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Avatar, Buttons, HelpMessage, Icons, IconUtils, TextInput, useEffect, UserStore, useState } from "@webpack/common";

import { autoLogin, getSavedTokens, loginToken, removeUser, saveToken } from "./utils";

const { getToken } = findByPropsLazy("getToken", "setToken");
const { closeSuspendedUser } = findByPropsLazy("loginToken", "switchAccountToken");

const cl = classNameFactory("vc-nl-");

let cachedToken: string | null = null;

function LoginModal(modalProps: ManaModalProps) {
    const [users, setUsers] = useState<{ id: string; name: string; avatar: { src: string; decoration?: string; }; }[]>([]);
    const [token, setToken] = useState("");
    const updater = useForceUpdater(true);

    useEffect(() => {
        getSavedTokens().then(tokens => {
            setUsers(Object.entries(tokens).map(([id, data]: any) => ({
                id,
                name: data.userInfo?.username,
                avatar: {
                    src: data.userInfo?.avatar?.src,
                    decoration: data.userInfo?.avatar?.decoration
                }
            })));
        });
    }, [updater]);

    return (
        <ManaModalRoot size="lg" {...modalProps}>
            <ManaModalHeader title="Auto Login" subtitle="Select an account to switch to" />
            <ManaModalContent>
                <div className={cl("quick-login")}>
                    <TextInput
                        placeholder="Paste your user token here"
                        value={token}
                        onChange={setToken}
                    />
                    <Buttons.Button icon={Icons.DoorEnterIcon} text={getIntlMessage("LOGIN")} onClick={() => loginToken(token)} />
                </div>
                {users.length === 0
                    ? <SectionHeader title="No saved accounts found" description="You have no saved accounts! They'll be added automatically once you login into one" />
                    : users.map(u => (
                        <div
                            key={u.id}
                            className={cl("user-row")}
                            onClick={() => {
                                autoLogin(u.id);
                                modalProps.onClose();
                            }}
                        >
                            <Avatar src={u.avatar.src} avatarDecoration={u.avatar.decoration} size="SIZE_40" />
                            <SectionHeader className={cl("user-info")} title={u.name} description={u.id} titleVariant="text-md/semibold" />
                            <Buttons.IconButton
                                icon={Icons.XLargeIcon}
                                variant="critical-secondary"
                                onClick={e => {
                                    e.stopPropagation();
                                    removeUser(u.id);
                                }} />
                        </div>
                    ))
                }
            </ManaModalContent>
        </ManaModalRoot>
    );
}

function LoginButton({ type }: { type?: number; } = {}) {
    const handleClick = () => openModal(props => <LoginModal {...props} />);

    return type === 1
        ? <Buttons.Button
            text="Auto Login"
            fullWidth
            onClick={handleClick}
        />
        : <Buttons.TextButton
            text="Auto Login"
            textVariant="text-sm/medium"
            variant="secondary"
            onClick={handleClick}
        />;
}

export default definePlugin({
    name: "NeverLogout",
    description: "Never get logged out of your account (READ DESC)",
    tags: ["Utility", "Shortcuts"],
    authors: [Devs.RoScripter999],
    searchTerms: ["MoreAlts"],

    // If user isn't logged-in the plugin wont start, thus this is required.
    startAt: StartAt.WebpackReady,
    settingsAboutComponent: () => (
        <>
            <HelpMessage className={Margins.bottom16} messageType="warn">Logging out from user settings will reset your token</HelpMessage>
            <Buttons.TextButton text="Logout without reset" onClick={() => closeSuspendedUser()} />
        </>
    ),

    LoginButton: ErrorBoundary.wrap(LoginButton, { noop: true }),

    patches: [
        {
            // Render button in the choose account card
            find: ".LOGIN_REQUIRED&&",
            lazy: true,
            replacement:
            {
                match: /\}\)\]\}/,
                replace: "}),$self.LoginButton()]}"
            }
        },
        {
            find: "#{intl::SWITCH_ACCOUNTS_ADD_AN_ACCOUNT_BUTTON}",
            lazy: true,
            replacement: [
                {
                    match: /\(0,\w+\.jsx\)\(\w+\.\w+,\{[^{}]{0,200}?text:\w+\.intl\.string\(\w+\.t\["9g2mqT"\]\)[^{}]{0,200}?\}\)/,
                    replace: "[$&,$self.LoginButton({type:0})]"
                }
            ]
        }
    ],

    flux: {
        LOGIN_SUCCESS(event: { token: string; }) {
            if (event?.token) cachedToken = event.token;
        },
        CONNECTION_OPEN(event: { user: { id: string; }; }) {
            const userId = event.user?.id;
            const token = cachedToken || getToken();
            const currentUser = UserStore.getUser(userId);

            if (userId && token && currentUser) {
                const avatarUrl = IconUtils.getUserAvatarURL(currentUser, true);
                const decorationUrl = IconUtils.getAvatarDecorationURL({ avatarDecoration: currentUser?.avatarDecoration as any, size: 128, canAnimate: true });

                saveToken(userId, token, currentUser.username, {
                    src: avatarUrl,
                    decoration: decorationUrl
                });

                cachedToken = null;
            }
        }
    },

    start() {
        const currentToken = getToken();
        const currentUser = UserStore.getCurrentUser();

        if (currentToken && currentUser) {
            const { id, username } = currentUser;
            const avatarUrl = IconUtils.getUserAvatarURL(currentUser, true);
            const decorationUrl = IconUtils.getAvatarDecorationURL({ avatarDecoration: currentUser?.avatarDecoration as any, size: 128, canAnimate: true });

            saveToken(id, currentToken, username, {
                src: avatarUrl,
                decoration: decorationUrl
            });
        }
    }
});
