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

import { Badge } from "@api/Badges";
import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { useSettings } from "@api/Settings";
import { Flex } from "@components/Flex";
import { BrokenHeart, GithubIcon, VelocityIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { QuickAction, QuickActionCard } from "@components/settings/QuickAction";
import { openContributorModal } from "@components/settings/tabs/plugins/ContributorModal";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import { SectionHeader } from "@components/settings/tabs/SectionHeader";
import { SettingsTab } from "@components/settings/tabs/SectionSettings";
import { Switch } from "@components/Switch";
import BadgeAPI from "@plugins/_api/badges";
import SettingsPlugin from "@plugins/_core/settings";
import { gitRemote } from "@shared/userAgent";
import { ChangeList } from "@utils/ChangeList";
import { DONOR_ROLE_ID, IS_MAC, IS_WINDOWS, VELOCITY_GUILD_ID, VELOCITY_GUILD_INVITE } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { openInviteModal } from "@utils/discord";
import { classes, identity, shouldShowContributorBadge } from "@utils/misc";
import { relaunch } from "@utils/native";
import { useCleanupEffect } from "@utils/react";
import type { SelectOption } from "@velocity-types";
import { Buttons, ConfirmModal, Forms, GuildMemberStore, HelpMessage, Icons, openModal, Parser, React, Select, Text, useRef, UserStore } from "@webpack/common";
import type { ComponentType } from "react";

import { MacOSVibrancySettings } from "./MacVibrancySettings";
import { NotificationSection } from "./NotificationSettings";

const cl = classNameFactory("vc-settings-velocity-");

const isDonor = (userId: string) => !!(
    (BadgeAPI.getDonorBadges(userId)?.length ?? 0) > 0
    && GuildMemberStore?.getMember(VELOCITY_GUILD_ID, userId)?.roles.includes(DONOR_ROLE_ID)
);

function SettingsList() {
    const settings = useSettings(["useQuickCss", "enableReactDevtools", "frameless", "windowMoveable", "winNativeTitleBar", "windowsMaterial", "transparent", "winCtrlQ", "disableMinSize", "rendererPerformanceBoost"]);
    const changes = useRef(new ChangeList<keyof typeof settings>()).current;

    type SettingItem = false | {
        key: keyof typeof settings;
        title: string;
        description?: string;
        icon: ComponentType<any>;
        restartRequired?: boolean;
        options?: ReadonlyArray<SelectOption>;
    };

    const Settings: Record<string, SettingItem[]> = {
        General: [
            {
                key: "useQuickCss",
                title: "Custom CSS",
                description: "Enable the QuickCSS editor and custom styles",
                icon: Icons.PaintbrushThickIcon
            },
            !IS_WEB && {
                key: "rendererPerformanceBoost",
                title: "Renderer Performance Boost",
                description: "Use GPU rasterization and hardware acceleration.",
                icon: Icons.SpeedometerIcon,
                restartRequired: true
            },
            IS_WINDOWS && !IS_WEB && VelocityNative.native.supportsWindowsMaterial() && {
                key: "windowsMaterial",
                title: "Background Material",
                description: "Windows transparent background effects. You need a theme that supports transparency or this will do nothing.",
                options: [
                    {
                        label: "None",
                        value: "none",
                        default: true
                    },
                    {
                        label: "Mica (incorporates system theme + desktop wallpaper to paint the background)",
                        value: "mica"
                    },
                    {
                        label: "Tabbed (variant of Mica with stronger background tinting)",
                        value: "tabbed"
                    },
                    {
                        label: "Acrylic (blurs the window for a translucent background)",
                        value: "acrylic"
                    }
                ],
                icon: Icons.PaintPaletteIcon,
                restartRequired: true
            },
            !IS_WEB && (!IS_DISCORD_DESKTOP || !IS_WINDOWS ? {
                key: "frameless",
                title: "Frameless Window",
                description: "Remove the native window frame",
                icon: Icons.FullscreenExitIcon,
                restartRequired: true
            } : {
                key: "winNativeTitleBar",
                title: "Native Title Bar",
                description: "Use Windows' native title bar instead of Discord's",
                icon: Icons.WindowTopIcon,
                restartRequired: true
            }),
            IS_DISCORD_DESKTOP && {
                key: "disableMinSize",
                title: "Minimum Size",
                description: "Remove restrictions on minimum window size",
                icon: Icons.CircleQuestionIcon,
                restartRequired: true
            },
            !IS_WEB && {
                key: "windowMoveable",
                title: "Window Lock",
                description: "Prevent moving or resizing the window",
                icon: Icons.LockIcon,
                restartRequired: true
            },
            !IS_WEB && IS_WINDOWS && {
                key: "winCtrlQ",
                title: "Quick Close",
                description: "Register Ctrl+Q as a shortcut to exit",
                icon: Icons.AIcon,
                restartRequired: true
            }
        ],
        Developer: [
            !IS_WEB && {
                key: "enableReactDevtools",
                title: "React Developer Tools",
                description: "Expose React DevTools for debugging",
                icon: Icons.ScienceIcon,
                restartRequired: true
            },
            !IS_WEB && {
                key: "transparent",
                title: "Window Transparency",
                description: "Enable transparency support for themes",
                icon: Icons.EyeIcon,
                restartRequired: true
            }
        ]
    };

    const handleToggle = (key: keyof typeof settings, value: any) => {
        if (settings[key] === value) return;

        settings[key] = value as never;

        const allItems = Object.values(Settings).flat();
        const setting = allItems.find((s): s is Exclude<SettingItem, false> => !!s && s.key === key);
        if (!setting?.restartRequired) return;

        changes.handleChange(key);

        if ([...changes.getChanges()].includes(key)) {
            openModal(props => (
                <ConfirmModal
                    {...props}
                    title="Restart Required"
                    subtitle="A restart is required to apply this change"
                    confirmText="Restart now"
                    cancelText="Later!"
                    variant="primary"
                    onConfirm={relaunch}
                />
            ));
        }
    };

    useCleanupEffect(() => {
        if (changes.hasChanges) {
            openModal(props => (
                <ConfirmModal
                    {...props}
                    title="Restart required!"
                    confirmText="Restart now"
                    cancelText="Later!"
                    onConfirm={relaunch}
                >
                    <>
                        <p>The following settings require a restart:</p>
                        <div>
                            {changes.map((s, i) => (
                                [
                                    i > 0 && ", ",
                                    Parser.parse("`" + s + "`")
                                ]
                            ))}
                        </div>
                    </>

                </ConfirmModal>
            ));
        }
    }, []);

    return (
        <div className={Margins.top16}>
            {Object.entries(Settings).map(([category, items]) => (
                <div key={category}>
                    <Text variant="text-xs/semibold" color="text-muted" className={Margins.top16}>
                        {category}
                    </Text>
                    {items.map(setting => {
                        if (!setting) return null;
                        const { key, title, description, icon: Icon, restartRequired } = setting;
                        return (
                            <div
                                key={key}
                                className={classes(cl("row"))}
                                onClick={setting.options ? undefined : () => handleToggle(key, !settings[key])}
                            >
                                <SectionHeader
                                    layout="horizontal"
                                    tag="h2"
                                    icon={() => <Icon size="md" color="currentColor" />}
                                    iconWrapperClassName={cl("row-icon")}
                                    title={title}
                                    titleVariant="text-md/semibold"
                                    titleColor="text-strong"
                                    description={
                                        <>
                                            {description && (
                                                <Text
                                                    variant="text-sm/normal"
                                                    color="text-muted"
                                                >
                                                    {description}
                                                </Text>
                                            )}
                                            {restartRequired && (
                                                <Flex alignItems="center" gap="4px" style={{ marginTop: 4 }}>
                                                    <Icons.RetryIcon size="xs" color="var(--text-brand)" />
                                                    <Text variant="text-xs/bold" color="text-brand">
                                                        Restart Required
                                                    </Text>
                                                </Flex>
                                            )}
                                        </>
                                    }
                                    style={{ flex: 1 }}
                                />
                                {setting.options ? (
                                    <div style={{ flex: 1 }}>
                                        <Select
                                            options={setting.options}
                                            isSelected={v => v === settings[key]}
                                            layout="horizontal"
                                            select={v => handleToggle(key, v)}
                                            closeOnSelect={true}
                                            serialize={identity}
                                        />
                                    </div>
                                ) : (
                                    <Switch
                                        checked={Boolean(settings[key])}
                                        onChange={v => handleToggle(key, v)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default function VelocitySettings() {
    const needsVibrancySettings = IS_DISCORD_DESKTOP && IS_MAC;
    const user = UserStore.getCurrentUser();

    const hasDonorBadge = isDonor(user?.id);
    const hasDevBadge = shouldShowContributorBadge(user?.id);

    return (
        <SettingsTab>
            {(hasDonorBadge || hasDevBadge) && (
                <div className={Margins.bottom8}>
                    <SectionHeader
                        icon={() => <Icons.MedalIcon color="var(--chip-yellow-light-background)" size="sm" />}
                        title="Awarded Badges"
                        titleColor="chip-yellow-light-background"
                        description="Perks and contributions tied to your user ID"
                        descriptionColor="text-code"
                        margin="bottom8"
                    />
                </div>
            )}
            {!hasDonorBadge && !hasDevBadge && (
                <div className={classes(Margins.bottom20, cl("no-badges"))}>
                    <BrokenHeart size="lg" color="text-muted" />

                    <Text variant="text-sm/semibold" color="text-muted">No badges earned yet</Text>
                    <Text variant="text-xs/normal" color="text-muted">
                        Badges will appear here when you do special stuff like contributing to a plugin!
                    </Text>
                </div>
            )}

            {hasDonorBadge && (
                <div className={Margins.bottom20}>
                    <Badge
                        icon={Icons.SparklesIcon}
                        name="Donations"
                        onClick={() => openInviteModal(VELOCITY_GUILD_INVITE)}
                    />
                </div>
            )}

            {hasDevBadge && (
                <div className={Margins.bottom20}>
                    <Badge
                        icon={VelocityIcon}
                        name="Contributions"
                        tooltip="Click to view how many plugins you contributed to"
                        onClick={() => openContributorModal(user)}
                    />
                </div>
            )}

            <section>
                <SectionHeader
                    icon={Icons.TopicsIcon}
                    title="Quick Actions"
                    description="Quick tasks and utilities for accessibility"
                    margin="bottom8"
                />

                <QuickActionCard>
                    <QuickAction Icon={Icons.TopicsIcon} text="Notification Log" action={openNotificationLogModal} />
                    <QuickAction Icon={Icons.PaintbrushThickIcon} text="Edit QuickCSS" action={() => VelocityNative.quickCss.openEditor()} />
                    {!IS_WEB && (
                        <>
                            <QuickAction Icon={Icons.RetryIcon} text="Relaunch Discord" action={relaunch} />
                            <QuickAction Icon={Icons.RetryIcon} text="Restart Discord" action={() => location.reload()} />
                            <QuickAction Icon={Icons.FolderIcon} text="Open Settings Folder" action={() => VelocityNative.settings.openFolder()} />
                        </>
                    )}
                    <QuickAction
                        Icon={GithubIcon}
                        text="View Source Code"
                        action={() => VelocityNative.native.openExternal(`https://github.com/${gitRemote}`)}
                    />
                </QuickActionCard>
            </section>

            <HelpMessage
                icon={() => <Icons.TopicsIcon size="sm" color="var(--icon-muted)" />}
                className={cl("hint")}
            >
                Hint: You can change the position of this section in the{" "}
                <Buttons.TextButton
                    onClick={() => openPluginModal(SettingsPlugin)}
                    variant="primary"
                    textVariant="text-sm/semibold"
                    text="Settings plugin"
                />
            </HelpMessage>

            <Forms.FormDivider gap={20} />

            <NotificationSection />
            <Forms.FormDivider gap={20} />

            <section>
                <SectionHeader
                    icon={Icons.SettingsIcon}
                    title="Velocity Settings"
                    description="Configure the native functionality of the client"
                    tag="h2"
                />

                <SettingsList />
            </section>

            {needsVibrancySettings && (
                <>
                    <Forms.FormDivider gap={20} />
                    <MacOSVibrancySettings />
                </>
            )}
        </SettingsTab>
    );
}
