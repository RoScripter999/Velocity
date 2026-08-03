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
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getIntlMessage, openUserProfile } from "@utils/discord";
import { copyToClipboard } from "@utils/misc";
import definePlugin, { OptionType, type PluginSettingComponentProps } from "@utils/types";
import type { Guild, ModalPropsRender, User } from "@velocity-types";
import { Avatar, Buttons, Clickable, DateUtils, Forms, GuildActions, HelpMessage, Icons, Modal, Select, Text, TextInput, Tooltip, useRef, useState } from "@webpack/common";

const cl = classNameFactory("vc-bbr-");

interface BanModalProps extends ModalPropsRender {
    guild: Guild;
    user: User;
    ban: { reason: string | null; };
}

interface BanReason {
    text: string;
    deleteSeconds?: number;
}

const toPlain = (r: BanReason): BanReason => r.deleteSeconds != null ? { text: r.text, deleteSeconds: r.deleteSeconds } : { text: r.text };

const makeEmptyReason: () => BanReason = () => ({
    text: "",
    deleteSeconds: 0
});

function ReasonsComponent({ setValue }: PluginSettingComponentProps) {
    const [reasons, setReasons] = useState(settings.store.reasons);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const save = (list: BanReason[]) => {
        const l = list.map(toPlain);
        setReasons(l);
        setValue(l);
    };

    return (
        <div>
            {reasons.map((r, i) => {
                const isLast = reasons.length <= 1;
                return (
                    <div key={i}>
                        <Flex className={Margins.bottom16} flexDirection="row" gap="0.5em">
                            <TextInput
                                inputRef={i === reasons.length - 1 ? inputRef : undefined}
                                placeholder={getIntlMessage("BAN_REASON")}
                                value={r.text}
                                onChange={v => {
                                    const list = reasons.map(toPlain);
                                    list[i] = { ...list[i], text: v };
                                    save(list);
                                }}
                                trailing={{
                                    type: "icon",
                                    tooltip: i === 0 ? getIntlMessage("RESET") : getIntlMessage("REMOVE"),
                                    disabled: i === 0 ? !r.text?.trim() : isLast,
                                    icon: () => {
                                        const Icon = i === 0 ? Icons.RetryIcon : Icons.TrashIcon;
                                        return <Icon color={i === 0 ? "currentColor" : (isLast ? "var(--icon-muted)" : "var(--icon-feedback-critical)")} size="sm" />;
                                    },
                                    onClick: () => {
                                        const list = reasons.map(toPlain);
                                        i === 0 ? (list[0] = makeEmptyReason()) : list.splice(i, 1);
                                        save(list);
                                    }
                                }}

                            />
                            <Select
                                options={[
                                    { id: "none", value: 0, label: getIntlMessage("DELETE_MESSAGE_HISTORY_OPTION_NONE") },
                                    { id: "1hour", value: 3600, label: getIntlMessage("DELETE_MESSAGE_HISTORY_OPTION_1HR") },
                                    { id: "6hours", value: 21600, label: getIntlMessage("DELETE_MESSAGE_HISTORY_OPTION_6HR") },
                                    { id: "12hours", value: 43200, label: getIntlMessage("DELETE_MESSAGE_HISTORY_OPTION_12HR") },
                                    { id: "1day", value: 86400, label: getIntlMessage("DELETE_MESSAGE_HISTORY_OPTION_24HR") },
                                    { id: "3days", value: 259200, label: getIntlMessage("DELETE_MESSAGE_HISTORY_OPTION_3D") },
                                    { id: "7days", value: 604800, label: getIntlMessage("DELETE_MESSAGE_HISTORY_OPTION_7D") }
                                ]}
                                onSelectionChange={v => {
                                    save(reasons.map((x, j) => j === i ? { ...toPlain(x), deleteSeconds: v ?? undefined } : toPlain(x)));
                                }}
                                fullWidth
                                value={r.deleteSeconds ?? null}
                            />
                        </Flex>
                    </div>
                );
            })}

            <Buttons.Button
                text="Add Reason"
                variant="secondary"
                size="sm"
                disabled={!reasons[reasons.length - 1]?.text?.trim()}
                icon={() => <Icons.PlusSmallIcon />}
                onClick={() => {
                    save([...reasons.map(toPlain), makeEmptyReason()]);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
            />
        </div>
    );
}

function BanModalComponent({ guild, user, ban, ...modalProps }: BanModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleUnban = async () => {
        setError(null);
        setLoading(true);
        try {
            await GuildActions.unbanUser(guild.id, user.id);
            modalProps.onClose();
        } catch (e: any) {
            setError(e.body?.message ?? null);
            setLoading(false);
        }
    };

    const copyUsername = () => {
        copyToClipboard(user.username);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal
            actions={[
                {
                    text: getIntlMessage("CLOSE"),
                    variant: "secondary",
                    onClick: modalProps.onClose
                },
                {
                    variant: "critical-primary",
                    text: getIntlMessage("REVOKE_BAN"),
                    icon: () => <Icons.HammerIcon color="currentColor" size="refresh_sm" />,
                    onClick: handleUnban,
                    loading: loading
                }
            ]}
            actionsFullWidth={false}
            title={
                <Flex alignItems="center" gap="12px">
                    <Clickable onContextMenu={() => openUserProfile(user.id)} style={{ cursor: "pointer" }}>
                        <Avatar src={user.getAvatarURL(guild.id, 96)} size="SIZE_80" />
                    </Clickable>
                    <section className={cl("ban-user-details")}>
                        {copied ? (
                            <Tooltip text={getIntlMessage("COPIED")} color="green" forceOpen={true}>
                                {props => (
                                    <Text
                                        {...props}
                                        variant="heading-xl/semibold"
                                        onClick={copyUsername}
                                        style={{ cursor: "pointer" }}
                                    >
                                        @{user.username}
                                    </Text>
                                )}
                            </Tooltip>
                        ) : (
                            <Text
                                variant="heading-xl/semibold"
                                onClick={copyUsername}
                                style={{ cursor: "pointer" }}
                            >
                                @{user.username}
                            </Text>
                        )}
                        {user.globalName && <Text variant="text-md/normal" color="text-subtle">{user.globalName}</Text>}
                        {!user.hasUniqueUsername() && <Text variant="text-md/normal" color="text-subtle">#{user.discriminator}</Text>}
                    </section>
                </Flex>
            }
            {...modalProps}
        >
            <div>
                <Forms.FormSection tag="h4" title={getIntlMessage("BAN_REASON")}>
                    <Text selectable variant="text-sm/normal">{ban?.reason || getIntlMessage("NO_BAN_REASON")}</Text>
                </Forms.FormSection>

                <Forms.FormSection className={Margins.top16} tag="h4" title="User Info">
                    <Text selectable variant="text-xs/normal" color="text-muted">User ID: {user.id}</Text>
                    {user.globalName && <Text selectable variant="text-xs/normal" color="text-muted">{getIntlMessage("DISPLAY_NAME")}: {user.globalName}</Text>}
                    <Text selectable variant="text-xs/normal" color="text-muted">{getIntlMessage("USER_PROFILE_DISCORD_MEMBER_SINCE")}: {DateUtils.calendarFormat(user.createdAt)}</Text>

                    {error && <HelpMessage className={Margins.top8} messageType="danger">{error}</HelpMessage>}
                </Forms.FormSection>
            </div>
        </Modal>
    );
}

const settings = definePluginSettings({
    reasons: {
        type: OptionType.COMPONENT,
        default: [makeEmptyReason()],
        component: props => <ReasonsComponent {...props} />
    },
    betterModal: {
        description: "Redesigns the user ban modal from the guild ban list",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    },
    removeAllReasons: {
        type: OptionType.BOOLEAN,
        description: "Removes all the premade reasons and only shows the custom reasons"
    },
    isOtherDefault: {
        type: OptionType.BOOLEAN,
        displayName: "Is \"Other\" Default",
        description: "Selects the 'Other' option by default. (Shows a text area)"
    }
});

export default definePlugin({
    name: "BetterBanReasons",
    description: "Create custom reasons to use in the Discord ban modal, and/or show a text input by default instead of the options.",
    authors: [Devs.RoScripter999],
    searchTerms: ["BetterGuildBans"],
    tags: ["Utility", "Servers", "Organisation"],
    settings,

    patches: [
        {
            find: "#{intl::FORM_LABEL_REASON_BAN}",
            lazy: true,
            replacement: [
                {
                    match: /\[({name:.+?,value:.+?},){2}{name:.+?,value:"other"}\]/,
                    replace: "$self.getReasons($1)"
                },
                {
                    match: /(?:\w+\.)?useState\(""\)(?=.{0,200}isArchivedThread)/,
                    replace: "useState($self.getDefaultState())"
                }
            ]
        },
        {
            find: "#{intl::REVOKE_BAN})",
            lazy: true,
            replacement: {
                match: /return\(0,(\w+)\.jsx\)\((\w+)\.Modal,/,
                replace: "return(0,$1.jsx)($self.renderBanModal,{...arguments[0]},"
            },
            predicate: () => settings.store.betterModal
        }
    ],

    renderBanModal(props: BanModalProps) {
        return <BanModalComponent {...props} />;
    },

    getReasons() {
        const storedReasons = settings.store.reasons
            .map(r => typeof r === "string" ? { text: r } : r)
            .filter(r => r.text.trim());

        const customReasons = storedReasons.map(r => ({ name: r.text, value: r.text }));
        const defaultReasons = [
            getIntlMessage("BAN_REASON_OPTION_SPAM_ACCOUNT"),
            getIntlMessage("BAN_REASON_OPTION_HACKED_ACCOUNT"),
            getIntlMessage("BAN_REASON_OPTION_BREAKING_RULES")
        ].map(s => ({ name: s, value: s }));

        const reasons = settings.store.removeAllReasons ? customReasons : defaultReasons.concat(customReasons);
        return reasons.concat({ name: getIntlMessage("BAN_REASON_OPTION_OTHER"), value: "other" });
    },

    getDefaultState: () => settings.store.isOtherDefault ? "other" : ""
});
