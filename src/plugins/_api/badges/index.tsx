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

import "./fixDiscordBadgePadding.css";

import { _getBadges, BadgePosition, BadgeType, BadgeUserArgs, openBadgesModal, ProfileBadge } from "@api/Badges";
import { BadgesModal } from "@api/Badges/BadgesComponent";
import ErrorBoundary from "@components/ErrorBoundary";
import { openContributorModal } from "@components/settings/tabs";
import { Devs } from "@utils/constants";
import { copyWithToast } from "@utils/discord";
import { Logger } from "@utils/Logger";
import { shouldShowContributorBadge } from "@utils/misc";
import { closeModal, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { ContextMenuApi, Icons, Menu, Toasts, UserStore } from "@webpack/common";

export const CONTRIBUTOR_BADGE = "https://cdn.discordapp.com/emojis/1487853399901995119.webp?size=64";

let DonorBadges = {} as Record<string, Array<Record<"tooltip" | "badge", string>>>;

async function loadBadges(noCache = false) {
    const init = {} as RequestInit;
    if (noCache)
        init.cache = "no-cache";

    // TODO: fuckoff vencord and host a real website
    DonorBadges = await fetch("https://badges.vencord.dev/badges.json", init)
        .then(r => r.json());
}

let intervalId: any;

function BadgeContextMenu({ badge }: { badge: Omit<ProfileBadge, "id"> & BadgeUserArgs; }) {
    return (
        <Menu.Menu
            navId="vc-badge-context"
            onClose={ContextMenuApi.closeContextMenu}
            aria-label="Badge Options"
        >
            {badge.description && (
                <Menu.MenuItem
                    id="vc-badge-copy-name"
                    label="Copy Badge Name"
                    action={() => copyWithToast(badge.description!)}
                />
            )}
            {badge.iconSrc && (
                <Menu.MenuItem
                    id="vc-badge-copy-link"
                    label="Copy Badge Image Link"
                    action={() => copyWithToast(badge.iconSrc!)}
                />
            )}
        </Menu.Menu>
    );
}

export default definePlugin({
    name: "BadgeAPI",
    description: "API to add badges to users",
    authors: [Devs.Megu, Devs.Ven, Devs.TheSun],
    required: true,
    patches: [
        {
            find: "#{intl::PROFILE_USER_BADGES}",
            replacement: [
                {
                    match: /alt:" ","aria-hidden":!0,src:.{0,50}(\i).iconSrc/,
                    replace: "...$1.props,$&"
                },
                {
                    match: /(?<=forceOpen:.{0,40}?ariaHidden:!0,)children:(?=.{0,50}?(\i)\.id)/,
                    replace: "children:$1.component?$self.renderBadgeComponent({...$1}) :"
                },
                {
                    match: /href:(\i)\.link/,
                    replace: "...$self.getBadgeMouseEventHandlers($1),$&"
                }
            ]
        },
        {
            find: "getLegacyUsername(){",
            replacement: {
                match: /getBadges\(\)\{.{0,100}?return\[/,
                replace: "$&...$self.getBadges(this),"
            }
        }
    ],

    get DonorBadges() {
        return DonorBadges;
    },

    toolboxActions: {
        async "Refetch Badges"() {
            await loadBadges(true);
            Toasts.show({
                id: Toasts.genId(),
                message: "Successfully refetched badges!",
                type: Toasts.Type.SUCCESS
            });
        }
    },

    userProfileBadge: [
        {
            id: "velocity_developer_badge",
            description: "Velocity Developer",
            iconSrc: CONTRIBUTOR_BADGE,
            position: BadgePosition.START,
            type: BadgeType.VELOCITY,
            meta: {
                description: "Created or contributed to a plugin",
                tooltip: "A user who has contributed in Velocity, Even if contributed on core or api plugins.",
                icon: () => <Icons.StaffBadgeIcon />
            },
            shouldShow: ({ userId }) => shouldShowContributorBadge(userId),
            onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId)),
            onContextMenu: (_, { userId }) => openBadgesModal({ userId: UserStore.getUser(userId).id })
        },
        {
            id: "velocity_core_contributor_badge",
            description: "Core Contributor",
            iconSrc: CONTRIBUTOR_BADGE,
            position: BadgePosition.START,
            type: BadgeType.VELOCITY,
            meta: {
                description: "Contributed to core plugins",
                tooltip: "A user who has contributed in core plugins of Velocity.",
                icon: () => <Icons.WrenchIcon />
            },
            shouldShow: ({ userId }) => shouldShowContributorBadge(userId, "core"),
            onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId)),
            onContextMenu: (_, { userId }) => openBadgesModal({ userId: UserStore.getUser(userId).id })
        },
        {
            id: "velocity_api_contributor_badge",
            description: "API Contributor",
            iconSrc: CONTRIBUTOR_BADGE,
            position: BadgePosition.START,
            type: BadgeType.VELOCITY,
            meta: {
                description: "Contributed to api plugins",
                tooltip: "A user who has contributed in api plugins of Velocity.",
                icon: () => <Icons.StarIcon />
            },
            shouldShow: ({ userId }) => shouldShowContributorBadge(userId, "api"),
            onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId)),
            onContextMenu: (_, { userId }) => openBadgesModal({ userId: UserStore.getUser(userId).id })
        }
    ] satisfies ProfileBadge[],

    async start() {
        await loadBadges();
        clearInterval(intervalId);
        intervalId = setInterval(loadBadges, 1000 * 60 * 30);
    },

    async stop() {
        clearInterval(intervalId);
    },

    getBadges(profile: { userId: string; guildId: string; }) {
        if (!profile) return [];

        try {
            return _getBadges(profile);
        } catch (e) {
            new Logger("BadgeAPI#getBadges").error(e);
            return [];
        }
    },

    renderBadgeComponent: ErrorBoundary.wrap((badge: ProfileBadge & BadgeUserArgs) => {
        const Component = badge.component!;
        return <Component {...badge} />;
    }, { noop: true }),

    getBadgeMouseEventHandlers(badge: ProfileBadge & BadgeUserArgs) {
        const handlers = {} as Record<string, (e: React.MouseEvent) => void>;
        if (!badge) return handlers;

        const { onClick, onContextMenu } = badge;
        if (onClick) handlers.onClick = e => onClick(e, badge);
        if (onContextMenu) handlers.onContextMenu = e => onContextMenu(e, badge);

        return handlers;
    },

    getDonorBadges(userId: string) {
        return DonorBadges[userId]?.map((badge, idx) => ({
            id: `vc_donor_badge_${idx}`,
            iconSrc: badge.badge,
            description: badge.tooltip,
            position: BadgePosition.START,
            type: BadgeType.DONOR,
            props: {
                style: {
                    borderRadius: "50%",
                    transform: "scale(0.9)"
                }
            },
            onContextMenu(event, badge) {
                ContextMenuApi.openContextMenu(event, () => <BadgeContextMenu badge={badge} />);
            },
            onClick() {
                const modalKey = openModal(props => (
                    <ErrorBoundary noop onError={() => {
                        closeModal(modalKey);
                        VelocityNative.native.openExternal("https://github.com/sponsors/Vendicated");
                    }}>
                        {BadgesModal(props, { userId, guildId: "" })}
                    </ErrorBoundary>
                ));
            }
        } satisfies ProfileBadge));
    }
});
