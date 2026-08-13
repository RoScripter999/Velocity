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

import { definePluginSettings } from "@api/Settings";
import { Flex } from "@components/Flex";
import { Paragraph } from "@components/Paragraph";
import { SectionHeader } from "@components/settings";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { copyWithToast, getIntlMessage } from "@utils/discord";
import { useForceUpdater } from "@utils/react";
import definePlugin, { OptionType } from "@utils/types";
import type { ModalPropsRender, SidebarItemNode } from "@velocity-types";
import { findByPropsLazy } from "@webpack";
import { Avatar, Buttons, ConfirmModal, Icons, IconUtils, LayoutType, Modal, openModal, TextInput, useEffect, UserStore, useState } from "@webpack/common";

import { autoLogin, getSavedTokens, loginToken, removeUser, saveToken } from "./utils";

const { getToken } = findByPropsLazy("getToken", "setToken");
const { closeSuspendedUser } = findByPropsLazy("loginToken", "switchAccountToken");

const cl = classNameFactory("vc-nl-");

let cachedToken: string | null = null;

const settings = definePluginSettings({
    autoLogin: {
        type: OptionType.SELECT,
        default: "",
        description: "Which account to automatically login if logged out",
        options: async () => {
            const tokens = await getSavedTokens();
            return Object.entries(tokens).map(([id, data]) => ({
                value: id,
                label: data.userInfo.username,
                icon: data.userInfo.avatar.src
            }));
        }
    }
});

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
                    trailing={{
                        type: "button", button: isValidToken && <Buttons.Button
                            icon={Icons.DoorEnterIcon}
                            variant="secondary"
                            size="sm"
                            text={getIntlMessage("LOGIN")}
                            onClick={() => loginToken(token)}
                        />
                    }}
                />
                <Buttons.Button
                    icon={Icons.CopyIcon}
                    variant="secondary"
                    text="Copy Token"
                    onClick={() => copyWithToast(getToken())}
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
        subtitle="Are you sure you wanna logout? This won't log you out of your account."
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
    settings,

    settingsAboutComponent: () => (
        <Flex flexDirection="column" gap=".5em">
            <Paragraph>
                Do not use the "Log out" button when using the plugin, Discord will reset your token if you do so.
                This plugin will not 100% always prevent logouts due to some issues with Discord
            </Paragraph>
            <Paragraph>
                Your token is saved on login and used whenever you need to login thru token.
            </Paragraph>
            <Paragraph>
                By using token logins; Discord will and not detect your location during the session.
                It is <strong>highly</strong> not recommended to share your token to other people.
            </Paragraph>
            <Paragraph>
                If you did share one of your "active" Discord tokens you should immediately logout using the "Log out" button to reset it.
            </Paragraph>
        </Flex>
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
            find: ".UTILITY_SECTION,{",
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
        },
        WINDOW_INIT() {
            const currentToken = getToken();

            if (!currentToken && settings.store.autoLogin) {
                autoLogin(settings.store.autoLogin);
            }
        }
    },

    start() {
        const currentToken = getToken();
        const currentUser = UserStore.getCurrentUser();

        if (currentToken && currentUser) {
            const { id, username } = currentUser;
            const avatarUrl = IconUtils.getUserAvatarURL(currentUser, true);
            const decorationUrl = IconUtils.getAvatarDecorationURL({ avatarDecoration: currentUser?.avatarDecoration, size: 128, canAnimate: true });

            saveToken(id, currentToken, username, {
                src: avatarUrl,
                decoration: decorationUrl
            });
        }
    }
});
