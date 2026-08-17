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

import "./fixDiscordBadgePadding.css";

import { _getBadges, BadgePosition, BadgeType, type BadgeUserArgs, type ProfileBadge } from "@api/Badges";
import ErrorBoundary from "@components/ErrorBoundary";
import { openContributorModal } from "@components/settings/tabs";
import { gitRemote } from "@shared/userAgent";
import { Devs } from "@utils/constants";
import { copyWithToast } from "@utils/discord";
import { Logger } from "@utils/Logger";
import { shouldShowContributorBadge } from "@utils/misc";
import definePlugin from "@utils/types";
import type { DiscordBadge } from "@velocity-types";
import { BadgeRarity } from "@velocity-types/enums";
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
                    replace: "children:$1.component?$self.renderBadgeComponent({...$1}):"
                },
                // Path with 2026-04-badge-discovery ON
                {
                    match: /(?<=fallbackIconSrc:.{0,50}?)children:(?=.{0,50}?(\i)\.id)/,
                    replace: "children:$1.component?$self.renderBadgeComponent({...$1}):"
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
        },
        {
            find: '"BadgeDirectoryStore"',
            replacement: [
                {
                    match: /(\i)\.get\((\i)\);return null!=\i\?Array\.from\(\i\.values\(\)\):\[\]/,
                    replace: "$1.get($2);return Array.from($self.badgeMaps($1.get($2),$2).values())"
                },
                {
                    match: /return null!=(\i)\?(\i)\.get\(\i\)\?\.get\((\i)\):void 0/,
                    replace: "return null!=$1?$self.badgeMaps($2.get($1),$1)?.get($3):void 0"
                }
            ]
        },
        {
            find: '"badge-details"',
            replacement: {
                match: /fromContent:\s*\w+\.\w+\.QUEST_BADGE\s*\}\s*\)\s*\}\s*,/,
                replace: "$&...$self.badgeActions(),"
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
            rarity: BadgeRarity.RARE,
            type: BadgeType.VELOCITY,
            meta: {
                description: "Created or contributed to a plugin",
                tooltip: "A user who has contributed in Velocity, Even if contributed on core or api plugins.",
                icon: Icons.StaffBadgeIcon
            },
            shouldShow: ({ userId }) => shouldShowContributorBadge(userId),
            onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId))
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
                icon: Icons.WrenchIcon
            },
            shouldShow: ({ userId }) => shouldShowContributorBadge(userId, "core"),
            onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId))
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
                icon: Icons.StarIcon
            },
            shouldShow: ({ userId }) => shouldShowContributorBadge(userId, "api"),
            onClick: (_, { userId }) => openContributorModal(UserStore.getUser(userId))
        }
    ],

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

    badgeMaps(map: Map<string, DiscordBadge>, userId: string) {
        const badges = new Map(map);

        for (const badge of _getBadges({ userId }).filter(b => b.type && b.type !== BadgeType.DONOR)) {
            badges.set(badge.id, {
                badge_id: badge.id,
                name: badge.description ?? "Velocity Badge",
                description: badge.meta?.description ?? "",
                simple_icon_url: badge.iconSrc,
                owned: true,
                is_earnable: false,
                rarity: badge.rarity ?? BadgeRarity.EPIC
            });
        }
        return badges;
    },

    badgeActions() {
        return {
            ...Object.fromEntries(
                ["velocity_developer_badge", "velocity_core_contributor_badge", "velocity_api_contributor_badge"].map(key => [
                    key, {
                        ctaLabel: () => key === "velocity_developer_badge" ? "Velocity Developer" : "Contrbute Velocity",
                        ctaAction: () => VelocityNative.native.openExternal(`https://github.com/${gitRemote}`)
                    }
                ])
            )
        };
    },

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
            onContextMenu: (event, badge) => ContextMenuApi.openContextMenu(event, () => <BadgeContextMenu badge={badge} />),
            onClick: () => VelocityNative.native.openExternal("https://github.com/sponsors/RoScripter999")
        } satisfies ProfileBadge));
    }
});
