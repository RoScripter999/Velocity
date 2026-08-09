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

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import { Margins } from "@components/margins";
import { Devs, IS_MAC } from "@utils/constants";
import { getCurrentChannel, insertTextIntoChatInputBox, sendMessage } from "@utils/discord";
import { useForceUpdater } from "@utils/react";
import definePlugin, { OptionType } from "@utils/types";
import type { Message, SelectOption, ToApi, User } from "@velocity-types";
import {
    ChannelActionCreators,
    ChannelActions,
    ChannelStore,
    CheckboxGroup,
    Field,
    HelpMessage,
    MessageActions,
    NavigationRouter,
    openModal,
    RestAPI,
    ScrollerThin,
    SearchableSelect,
    SelectedChannelStore,
    SettingsRouter,
    Text,
    UserStore,
    useState,
    useStateFromStores,
    VoiceActions,
    VoiceStateStore
} from "@webpack/common";

import { type Action, ControlsPanel } from "./controlsPanel";
import { Categories, cl, decodeCommand } from "./utils";

function AllowedUsersComponent() {
    const forceUpdate = useForceUpdater();
    const [activeUserId, setActiveUserId] = useState<string | null>(null);

    const allowedUsers = settings.store.allowedUsers || { users: [], permissions: {} };
    const users = allowedUsers.users || [];
    const permissions = allowedUsers.permissions || {};

    const actions = getActions(UserStore.getCurrentUser());

    const options = useStateFromStores([ChannelStore, UserStore], () => {
        const userIds = ChannelStore.getDMUserIds();

        return userIds
            .map(id => UserStore.getUser(id))
            .map(user => ({
                label: user.username, description: user.globalName,
                value: user.id, id: user.id, leading: { type: "avatar", src: user.getAvatarURL() }
            }));
    }, []) satisfies SelectOption[];

    const handleSelectionChange = (newSelection: string[]) => {
        const selectedUsers = newSelection.map(id => String(id));
        allowedUsers.users = selectedUsers;

        for (const userId of Object.keys(permissions)) {
            if (!selectedUsers.includes(userId)) delete permissions[userId];
        }

        for (const userId of selectedUsers) {
            if (!permissions[userId]) {
                permissions[userId] = [...actions.map(action => action.id)];
            }
        }

        if (activeUserId && !selectedUsers.includes(activeUserId)) {
            setActiveUserId(null);
        }

        forceUpdate();
    };

    const handleCheckboxChange = (checkedActionIds: string[]) => {
        if (!activeUserId) return;
        permissions[activeUserId] = [...checkedActionIds];

        forceUpdate();
    };

    const activeSelectedUser = options.find(opt => opt.value === activeUserId);
    return (
        <>
            <SearchableSelect
                label="Allowed Users"
                description="Select users that can execute actions on your account"
                options={options}
                selectionMode="multiple"
                value={users}
                closeOnSelect={false}
                onSelectionChange={handleSelectionChange}
            />
            {users.length > 0 && (
                <Field label="Permissions" description="Control which actions users can execute on you">
                    <div className={cl("perms-container")}>
                        <div className={cl("perms-left")}>
                            <ScrollerThin className={cl("perms-scroller")}>
                                {users.map(userId => {
                                    const userOpt = options.find(opt => opt.value === userId);
                                    return (
                                        <div key={userId} tabIndex={0} className={cl("perms-item-bttn")}>
                                            <div
                                                onClick={() => setActiveUserId(userId)}
                                                className={`${cl("perms-item")} ${activeUserId === userId ? cl("perms-item-active") : ""}`}
                                            >
                                                <img className={cl("perms-item-avatar")} src={userOpt?.leading.src} />
                                                <Text className={cl("perms-item-text")}>
                                                    {userOpt?.label || userId}
                                                </Text>
                                            </div>
                                        </div>
                                    );
                                })}
                            </ScrollerThin>
                        </div>

                        <div className={cl("perms-right")}>
                            {activeUserId && activeSelectedUser ? (
                                <ScrollerThin className={cl("perms-scroller")}>
                                    <Text className={Margins.bottom8} variant="text-md/semibold">
                                        Permissions for {activeSelectedUser.label}
                                    </Text>
                                    <CheckboxGroup
                                        options={
                                            actions.map(action => ({
                                                value: action.id,
                                                label: action.label,
                                                description: action.description
                                            }))
                                        }
                                        selectedValues={permissions[activeUserId] ?? []}
                                        onChange={handleCheckboxChange}
                                    />
                                </ScrollerThin>
                            ) : (
                                <Text color="text-muted">Select a user from the left to configure actions.</Text>
                            )}
                        </div>
                    </div>
                </Field>
            )}
        </>
    );
}

const settings = definePluginSettings({
    allowedUsers: {
        type: OptionType.COMPONENT,
        component: AllowedUsersComponent,
        default: { users: [], permissions: {} } as { users: string[]; permissions: Record<string, string[]>; }
    }
});

const getActions = (target: User, channelId?: string): Action[] => {
    const isInVoice = (selfId: string) => !!VoiceStateStore.getVoiceStateForUser(selfId)?.channelId;

    return [
        {
            id: "openSettings",
            label: "Open User Settings",
            description: "Opens the user settings modal, in addition with a path.",
            options: {
                text: {
                    type: OptionType.STRING,
                    description: "Panel node key",
                    default: ""
                }
            },
            execute: options => SettingsRouter.openUserSettings(options.text)
        },
        {
            id: "mentionUser",
            label: "Mention",
            description: "Sends a command message that triggers a mention on the target's client",
            category: Categories.CHAT,
            execute: async () => await sendMessage(channelId ?? SelectedChannelStore.getChannelId(), { content: `<@${target.id}>` })
        },
        {
            id: "typeInChat",
            label: "Type in Chat",
            description: "Inserts text into the target's chat input box",
            category: Categories.CHAT,
            options: {
                text: {
                    type: OptionType.STRING,
                    description: "Text to insert",
                    default: ""
                }
            },
            execute: options => insertTextIntoChatInputBox(options.text ?? "")
        },
        {
            id: "callUser",
            label: "Call User",
            description: "Makes the target user start a voice call",
            category: Categories.VOICE,
            execute: () => ChannelActionCreators.openPrivateChannel({ recipientIds: target.id, joinCall: true })
        },
        {
            id: "leaveCall",
            label: "Leave Call",
            description: "Makes the target user disconnect from their current voice call",
            category: Categories.VOICE,
            predicate: isInVoice,
            execute: () => ChannelActions.disconnect()
        },
        {
            id: "mute",
            label: "Mute",
            description: "Toggles self-mute on the target's client",
            category: Categories.VOICE,
            predicate: isInVoice,
            execute: () => VoiceActions.toggleSelfMute()
        },
        {
            id: "deafen",
            label: "Deafen",
            description: "Toggles self-deafen on the target's client",
            category: Categories.VOICE,
            predicate: isInVoice,
            execute: () => VoiceActions.toggleSelfDeaf()
        },
        {
            id: "setStatus",
            label: "Set Status",
            description: "Changes the target's active presence status",
            category: Categories.USER,
            options: {
                status: {
                    type: OptionType.SELECT,
                    options: [
                        { label: "Online", value: "online", default: true },
                        { label: "Idle", value: "idle" },
                        { label: "Do Not Disturb", value: "dnd" },
                        { label: "Invisible", value: "invisible" }
                    ],
                    description: "Status to change to",
                    default: "online"
                }
            },
            execute: options => {
                RestAPI.patch({
                    url: "/users/@me/settings",
                    body: {
                        status: options.status
                    }
                });
            }
        },
        {
            id: "setCustomStatus",
            label: "Set Custom Status",
            description: "Updates the custom text status on the target's client",
            category: Categories.USER,
            options: {
                text: {
                    type: OptionType.STRING,
                    description: "Status text to set",
                    default: ""
                }
            },
            execute: options => {
                RestAPI.patch({
                    url: "/users/@me/settings",
                    body: {
                        custom_status: {
                            text: options.text
                        }
                    }
                });
            }
        },
        {
            id: "setTheme",
            label: "Set Theme",
            description: "Changes the target's theme",
            category: Categories.USER,
            options: {
                theme: {
                    type: OptionType.SELECT,
                    options: [
                        { label: "Light", value: "light", default: true },
                        { label: "Ash", value: "dark" },
                        { label: "Dark", value: "darker" },
                        { label: "Onyx", value: "midnight" }
                    ],
                    description: "Which theme to change",
                    default: "light"
                }
            },
            execute: options => {
                RestAPI.patch({
                    url: "/users/@me/settings",
                    body: {
                        theme: options.theme
                    }
                });
            }
        },
        {
            id: "setLocale",
            label: "Set Locale",
            description: "Changes the target's locale language",
            category: Categories.USER,
            options: {
                locale: {
                    type: OptionType.SELECT,
                    options: [
                        { label: "Bulgarian (български)", value: "bg" },
                        { label: "Chinese Simplified (简体中文)", value: "zh-CN" },
                        { label: "Chinese Traditional (繁體中文)", value: "zh-TW" },
                        { label: "Croatian (Hrvatski)", value: "hr" },
                        { label: "Czech (Čeština)", value: "cs" },
                        { label: "Danish (Dansk)", value: "da" },
                        { label: "Dutch (Nederlands)", value: "nl" },
                        { label: "English (UK)", value: "en-GB" },
                        { label: "English (US)", value: "en-US", default: true },
                        { label: "Finnish (Suomi)", value: "fi" },
                        { label: "French (Français)", value: "fr" },
                        { label: "German (Deutsch)", value: "de" },
                        { label: "Greek (Ελληνικά)", value: "el" },
                        { label: "Hindi (हिन्दी)", value: "hi" },
                        { label: "Hungarian (Magyar)", value: "hu" },
                        { label: "Italian (Italiano)", value: "it" },
                        { label: "Japanese (日本語)", value: "ja" },
                        { label: "Korean (한국어)", value: "ko" },
                        { label: "Lithuanian (Lietuvių)", value: "lt" },
                        { label: "Norwegian (Norsk)", value: "no" },
                        { label: "Polish (Polski)", value: "pl" },
                        { label: "Portuguese, Brazilian (Português do Brasil)", value: "pt-BR" },
                        { label: "Romanian (Română)", value: "ro" },
                        { label: "Russian (Русский)", value: "ru" },
                        { label: "Spanish, Spain (Español de España)", value: "es-ES" },
                        { label: "Spanish, LATAM (Español de América Latina)", value: "es-419" },
                        { label: "Swedish (Svenska)", value: "sv-SE" },
                        { label: "Thai (ไทย)", value: "th" },
                        { label: "Turkish (Türkçe)", value: "tr" },
                        { label: "Ukrainian (Українська)", value: "uk" },
                        { label: "Vietnamese (Tiếng Việt)", value: "vi" }
                    ],
                    description: "Which language to change",
                    default: "en-US"
                }
            },
            execute: options => {
                RestAPI.patch({
                    url: "/users/@me/settings",
                    body: {
                        locale: options.locale
                    }
                });
            }
        },
        {
            id: "openChannel",
            label: "Open Channel",
            description: "Changes the active channel focused on the target's client",
            options: {
                guildId: {
                    type: OptionType.STRING,
                    description: "Guild ID (use '@me' for private messages/DMs)",
                    default: "@me"
                },
                channelId: {
                    type: OptionType.STRING,
                    description: "Channel ID",
                    default: ""
                }
            },
            execute: options => {
                if (options.channelId) {
                    NavigationRouter.transitionTo(`/channels/${options.guildId || "@me"}/${options.channelId}`);
                }
            }
        },
        {
            id: "reload",
            label: "Reload",
            description: "Reloads the target's Discord client",
            category: Categories.SYSTEM,
            execute: () => location.reload()
        },
        {
            id: "crash",
            label: "Crash",
            description: "Crashes the target's Discord client",
            category: Categories.SYSTEM,
            execute: () => window.DiscordErrors.softCrash({ message: "Unexpected crash" })
        }
    ];
};

export default definePlugin({
    name: "ControlUsers",
    description: "Allows you to make other users do specific prebuilt actions when sending message. (requires other user to have this plugin enabled)",
    authors: [Devs.RoScripter999],
    settings,

    settingsAboutComponent: () => {
        return (
            <HelpMessage messageType="info">Press Ctrl + F9 to open the control menu.</HelpMessage>
        );
    },

    patches: [
        {
            find: '"Skipping message send because send_fail_100 is enabled"',
            replacement: {
                match: /!0\},(\i)\)/,
                replace: "$&.then(e=>$self.onMessageCreate(e.body))"
            }
        },
        {
            find: '"MessageStore"',
            replacement: {
                match: /(?<=MESSAGE_CREATE:function\((\i)\)\{)/,
                replace: (_, props) => `$self.onMessageReceive(${props}.message);`
            }
        }
    ],

    start() {
        window.addEventListener("keydown", this.event);
    },

    stop() {
        window.removeEventListener("keydown", this.event);
    },

    event(e: KeyboardEvent) {
        if (e.code === "F9" && (IS_MAC ? e.metaKey : e.ctrlKey) && !e.repeat) {
            const recipientId = getCurrentChannel()?.recipients?.find(id => id !== UserStore.getCurrentUser()?.id);
            if (!recipientId) return;

            const target = UserStore.getUser(recipientId);
            if (!target) return;
            void openModal(({ actions: _, ...props }) => <ControlsPanel actions={getActions(target)} target={target} {...props} />);
        }
    },

    onMessageReceive(message: ToApi<Message>) {
        if (message.author.id === UserStore.getCurrentUser()?.id) return;
        void this.onMessageCreate(message);
    },

    async onMessageCreate(message: ToApi<Message>) {
        const currentUserId = UserStore.getCurrentUser()?.id;
        const allowedIds = new Set(settings.store.allowedUsers.users || []);

        if (!allowedIds.has(message.author?.id) && message.author?.id !== currentUserId) return;

        const decoded = decodeCommand(message.content);
        if (!decoded) return;

        if (allowedIds.has(message.author?.id) && message.author?.id !== currentUserId) {
            const userPermissions = settings.store.allowedUsers.permissions?.[message.author.id] || [];
            if (!userPermissions.includes(decoded.id)) return;

            const action = getActions(message.author, message.channel_id).find(a => a.id === decoded.id);

            if (action && (!action.predicate || action.predicate(currentUserId!))) {
                await action.execute(decoded.options);
            }
        }

        if (message.author?.id === currentUserId) {
            MessageActions.deleteMessage(message.channel_id, message.id);
        }
    }
});
