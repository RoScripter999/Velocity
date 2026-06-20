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

import { _getBadges, BadgeType } from "@api/Badges";
import { SectionHeader } from "@components/settings/tabs/SectionHeader";
import { classNameFactory } from "@utils/css";
import { wordsToTitle } from "@utils/text";
import type { ModalPropsRender } from "@velocity-types";
import { Avatar, Forms, Icons, IconUtils, Modal, Text, UserStore } from "@webpack/common";
import type { JSX, ReactNode } from "react";

import type { BadgeUserArgs, ProfileBadge } from ".";

const cl = classNameFactory("vc-badge-");

export function Badge({ icon: Icon, title, description, tooltip, onClick }: { icon: JSX.ElementType; title: string; description: ReactNode; tooltip?: string; onClick?: () => void; }) {
    return (
        <div className={cl("badge")} onClick={onClick}>
            <SectionHeader
                layout="horizontal"
                icon={() => <Icon size="custom" height="24" width="24" color="currentColor" />}
                iconWrapperClassName={cl("icon")}
                title={title}
                tooltip={tooltip}
                tooltipIcon={false}
                titleVariant="text-md/bold"
                titleColor="text-brand"
                description={description}
                descriptionColor="text-code"
            />
        </div>
    );
}

export function BadgeSection({ title, description, badges, args }: { title?: string, description?: string, badges: ProfileBadge[]; args: BadgeUserArgs; }) {
    if (badges.length === 0) return (
        <div className={cl("no-badges")}>
            <Text variant="text-sm/normal" color="text-muted">No badges to display.</Text>
        </div>
    );

    return (
        <>
            {(title && description) && (
                <SectionHeader
                    title={title}
                    description={description}
                    titleVariant="text-md/semibold"
                    tag="h2"
                    margin="bottom8"
                />
            )}

            <div className={cl("grid")}>
                {badges.map((badge, i) => {
                    if (badge.component) {
                        const Component = badge.component;
                        return <div key={i}><Component {...badge} {...args} /></div>;
                    }

                    if (!badge.iconSrc) return null;

                    return (
                        <Badge
                            key={i}
                            icon={badge.meta?.icon ?? (() => (
                                <img
                                    src={badge.iconSrc}
                                    alt={badge.description}
                                    style={{ width: 24, height: 24, borderRadius: "50%", ...badge.props?.style }}
                                />
                            ))}
                            title={badge.description ?? "Badge"}
                            description={badge.meta?.description ?? badge.type ?? ""}
                            tooltip={badge.meta?.tooltip}
                            onClick={badge.onClick ? () => badge.onClick!(new MouseEvent("click") as any, { ...badge, ...args }) : undefined}
                        />
                    );
                })}
            </div>
        </>
    );
}

export function BadgesModal(modalProps: ModalPropsRender, args: Omit<BadgeUserArgs, "guildId">) {
    const allBadges = _getBadges(args).filter(b => b.type);

    const velocityBadges = allBadges.filter(b => b.type === BadgeType.VELOCITY);
    const donorProfileBadges = allBadges.filter(b => b.type === BadgeType.DONOR);

    const user = UserStore.getUser(args.userId);

    return (
        <Modal
            {...modalProps}
            size="lg"
            title={
                <SectionHeader
                    title={wordsToTitle([user.username, "Badges"])}
                    description="Badges earned by supporting Velocity or doing something special"
                    titleVariant="text-lg/bold"
                    layout="horizontal"
                    icon={() => <Avatar size="SIZE_56" src={IconUtils.getUserAvatarURL(user, true)} avatarDecoration={IconUtils.getAvatarDecorationURL({
                        avatarDecoration: user.avatarDecoration,
                        size: 56,
                        canAnimate: true
                    })} />}
                    titleColor="text-strong"
                />
            }
            actionsFullWidth={false}
            actions={[
                {
                    text: "Become a Donor",
                    icon: Icons.HeartIcon,
                    onClick: () => VelocityNative.native.openExternal("https://github.com/sponsors/RoScripter999")
                }
            ]}

        >
            <div className={cl("content")}>
                {velocityBadges.length > 0 && (
                    <section>
                        <BadgeSection
                            title="Badges"
                            description="Special badges earned through contributions or other achievements"
                            badges={velocityBadges}
                            args={args}
                        />
                    </section>
                )}

                {velocityBadges.length > 0 && donorProfileBadges.length > 0 && (
                    <Forms.FormDivider />
                )}

                {donorProfileBadges.length > 0 && (
                    <section>
                        <BadgeSection
                            title="Donor Badges"
                            description="Exclusive badges for supporters of Velocity"
                            badges={donorProfileBadges}
                            args={args}
                        />
                    </section>
                )}

                {velocityBadges.length === 0 && donorProfileBadges.length === 0 && (
                    <div className={cl("no-badges")}>
                        <Text variant="text-sm/normal" color="text-muted">How did you figure out how to get here ??</Text>
                    </div>
                )}
            </div>
        </Modal>
    );
}
