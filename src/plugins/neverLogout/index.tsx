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

import "./styles.css";

import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getIntlMessage } from "@utils/discord";
import { useForceUpdater } from "@utils/react";
import definePlugin, { StartAt } from "@utils/types";
import type { ModalPropsRender, SidebarItemNode } from "@velocity-types";
import { LayoutType } from "@velocity-types/enums";
import { findByPropsLazy } from "@webpack";
import { Avatar, Buttons, closeAllModals, ConfirmModal, HelpMessage, Icons, IconUtils, Modal, openModal, TextInput, useEffect, UserStore, useState } from "@webpack/common";

import { autoLogin, getSavedTokens, loginToken, removeUser, saveToken } from "./utils";

const { getToken } = findByPropsLazy("getToken", "setToken");
const { closeSuspendedUser } = findByPropsLazy("loginToken", "switchAccountToken");

const cl = classNameFactory("vc-nl-");

let cachedToken: string | null = null;

function LoginModal(modalProps: ModalPropsRender) {
    const [users, setUsers] = useState<{ id: string; name: string; avatar: { src: string; decoration?: string; }; }[]>([]);
    const [token, setToken] = useState("");
    const updater = useForceUpdater(true);

    useEffect(() => {
        getSavedTokens().then(tokens => {
            setUsers(Object.entries(tokens).map(([id, data]) => ({
                id,
                name: data.userInfo?.username,
                avatar: {
                    src: data.userInfo?.avatar?.src,
                    decoration: data.userInfo?.avatar?.decoration
                }
            })));
        });
    }, [updater]);

    const isValidToken = /^[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{20,}$/.test(token);

    return (
        <Modal title="Manage Account Tokens" subtitle="Select an account to switch to" size="lg" {...modalProps}>
            <div className={cl("quick-login")}>
                <TextInput
                    placeholder="Paste your user token here"
                    value={token}
                    error={token.length > 0 && !isValidToken ? "Invalid User Token" : undefined}
                    onChange={setToken}
                />
                <Buttons.Button
                    disabled={!isValidToken}
                    icon={Icons.DoorEnterIcon}
                    text={getIntlMessage("LOGIN")}
                    onClick={() => loginToken(token)}
                />
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
        </Modal>
    );
}

function LoginButton(array?: boolean) {
    const handleClick = () => openModal(props => <LoginModal {...props} />);

    return array
        ? {
            text: "Account Tokens",
            variant: "secondary",
            onClick: handleClick
        }

        : <Buttons.TextButton
            text="Use Account Tokens"
            textVariant="text-sm/medium"
            variant="secondary"
            onClick={handleClick}
        />;
}

const NeverLogoutSidebar = (): SidebarItemNode => ({
    key: "neverlogout_logout_sidebar_item",
    variant: "destructive",
    type: LayoutType.SIDEBAR_ITEM,
    useTitle: () => "Go to Login Menu",
    icon: Icons.DoorExitIcon,
    buildLayout: () => [],
    onClick: () => openModal(modalProps => <ConfirmModal
        {...modalProps}
        title="Logout"
        subtitle="Are you sure you wanna logout? This wont log you out of your account."
        confirmText="Logout"
        onConfirm={closeSuspendedUser}
    />)
});

export default definePlugin({
    name: "NeverLogout",
    description: "Never get logged out of your account (READ DESC)",
    tags: ["Utility", "Shortcuts"],
    authors: [Devs.RoScripter999],
    searchTerms: ["MoreAlts", "Backup", "Accounts"],

    // If user isn't logged-in the plugin wont start, thus this is required.
    startAt: StartAt.WebpackReady,
    settingsAboutComponent: () => (
        <>
            <HelpMessage className={Margins.bottom16} messageType="warn">Logging out from user settings will reset your token</HelpMessage>
            <Buttons.TextButton text="Logout without reset" onClick={() => { closeSuspendedUser(); closeAllModals(); }} />
        </>
    ),

    LoginButton,
    NeverLogoutSidebar,

    patches: [
        {
            // Render button in the choose account card
            find: "#{intl::SWITCH_ACCOUNTS_CHOOSE_ACCOUNT_HELPER}",
            lazy: true,
            replacement: {
                match: /(#{intl::SWITCH_ACCOUNTS_ADD_AN_ACCOUNT_BUTTON}[\s\S]*?onClick:\s*\w+\s*\}\)\s*\}\))/,
                replace: "$1, $self.LoginButton(false)"
            }
        },
        {
            find: "#{intl::SWITCH_ACCOUNTS_ADD_AN_ACCOUNT_BUTTON}),variant",
            lazy: true,
            replacement: {
                match: /(actions:\s*\[\s*\{\s*text:[\s\S]*?g\.\i#{intl::SWITCH_ACCOUNTS_ADD_AN_ACCOUNT_BUTTON}\)?,[\s\S]*?\}\s*)(\])/,
                replace: "$1,$self.LoginButton(true)$2"
            }
        },
        // why error stack trace when you can just optional it and prevent the useless error entirely? :D
        {
            find: "&&this.startSession(",
            replacement: {
                match: /(\i)&&this\.startSession\((\w+)\)/,
                replace: "$1&&this?.startSession?.($2)"
            }
        },

        {
            find: "UserSettingsRoot_buildLayout",
            lazy: true,
            replacement: {
                match: /(\i\.\i\.UTILITY_SECTION,\{[\s\S]*?buildLayout:\(\)=>\[)(\i(?:,\i)*)(\])/,
                replace: "$1$2,$self.NeverLogoutSidebar()$3"
            }
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
                const decorationUrl = IconUtils.getAvatarDecorationURL({ avatarDecoration: currentUser?.avatarDecoration, size: 128, canAnimate: true });

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
