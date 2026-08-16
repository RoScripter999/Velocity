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

import "./style.css";

import { addProfileBadge, BadgePosition, type BadgeUserArgs, type ProfileBadge, removeProfileBadge } from "@api/Badges";
import { addMemberListDecorator, removeMemberListDecorator } from "@api/MemberListDecorators";
import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { definePluginSettings } from "@api/Settings";
import { Icon } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin, { type IconComponent, OptionType } from "@utils/types";
import type { ClientStatusMap, Platform, Status, User } from "@velocity-types";
import { filters, mapMangledModuleLazy } from "@webpack";
import { AuthenticationStore, Icons as DiscordIcons, PresenceStore, SessionsStore, Tooltip, UserStore, useStateFromStores } from "@webpack/common";

const { useStatusFillColor } = mapMangledModuleLazy([".5625*", "translate"], {
    useStatusFillColor: filters.byCode(".hex")
});

const platformMap = {
    embedded: "Console",
    vr: "VR"
};

const badge: ProfileBadge = {
    id: "vc_platform_indicator_wrapper",
    getBadges,
    position: BadgePosition.START
};

const indicatorLocations = {
    list: {
        description: "In the member list",
        onEnable: () => addMemberListDecorator("platform-indicator", ({ user }) => renderPlatformIndicators(user, true)),
        onDisable: () => removeMemberListDecorator("platform-indicator")
    },
    badges: {
        description: "In user profiles, as badges",
        onEnable: () => addProfileBadge(badge),
        onDisable: () => removeProfileBadge(badge)
    },
    messages: {
        description: "Inside messages",
        onEnable: () => addMessageDecoration("platform-indicator", props => renderPlatformIndicators(props.message?.author, false)),
        onDisable: () => removeMessageDecoration("platform-indicator")
    }
};

const settings = definePluginSettings({
    ...Object.fromEntries(
        Object.entries(indicatorLocations).map(([key, value]) => {
            return [key, {
                type: OptionType.BOOLEAN,
                description: `Show indicators ${value.description.toLowerCase()}`,
                // onChange doesn't give any way to know which setting was changed, so restart required
                restartNeeded: true,
                default: true
            }];
        })
    ),
    colorMobileIndicator: {
        type: OptionType.BOOLEAN,
        description: "Whether to make the mobile indicator match the color of the user status.",
        default: true,
        restartNeeded: true
    }
});

function getPlatformTooltip(platform: Platform): string {
    return platformMap[platform] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

const DesktopIcon: IconComponent = props => (
    <Icon {...props} width={props.size === "xs" ? 16 : 20} height={props.size === "xs" ? 16 : 20} fill={props.color}>
        <path d="M4 2.5c-1.103 0-2 .897-2 2v11c0 1.104.897 2 2 2h7v2H7v2h10v-2h-4v-2h7c1.103 0 2-.896 2-2v-11c0-1.103-.897-2-2-2H4Zm16 2v9H4v-9h16Z" />
    </Icon>
);

const PlatformIcon = ({ platform, status, small }: { platform: Platform, status: Status; small: boolean; }) => {
    const Icons = {
        desktop: DesktopIcon,
        web: DiscordIcons.GlobeEarthIcon,
        mobile: DiscordIcons.MobilePhoneIcon,
        embedded: DiscordIcons.GameControllerIcon,
        vr: DiscordIcons.VrHeadsetIcon
    } satisfies Record<Platform, IconComponent>;

    const tooltip = getPlatformTooltip(platform);
    const Icon = Icons[platform] ?? Icons.desktop;

    const fillColor = useStatusFillColor(status);

    return (
        <Tooltip text={tooltip}>
            {props => (
                <Icon
                    {...props}
                    color={fillColor}
                    size={small ? "xs" : "refresh_sm"}
                />
            )}
        </Tooltip>
    );
};

function getOwnStatus(): ClientStatusMap {
    const sessions = SessionsStore.getSessions();
    if (typeof sessions !== "object") return {};

    const sortedSessions = Object.values(sessions).sort(({ status: a }, { status: b }) => {
        if (a === b) return 0;
        if (a === "online") return 1;
        if (b === "online") return -1;
        if (a === "idle") return 1;
        if (b === "idle") return -1;
        return 0;
    });

    return Object.values(sortedSessions).reduce((acc, curr) => {
        if (curr.clientInfo.client !== "unknown")
            acc[curr.clientInfo.client] = curr.status;
        return acc;
    }, {});
}

function getBadges({ userId }: BadgeUserArgs): ProfileBadge[] {
    const user = UserStore.getUser(userId);

    if (!user || user.bot) return [];

    const status = user.id === AuthenticationStore.getId()
        ? getOwnStatus()
        : PresenceStore.getClientStatus(user.id);
    if (!status) return [];

    return Object.entries(status).map(([platform, status]) => ({
        key: `vc-platform-indicator-${platform}`,
        id: `vc-platform-indicator-${platform}`,
        component: () => (
            <span key={platform} className="vc-platform-indicator">
                <PlatformIcon
                    key={platform}
                    platform={platform as Platform}
                    status={status}
                    small={false}
                />
            </span>
        )
    }));
}

function PlatformIndicators({ statusMap, small }: { statusMap: ClientStatusMap; small: boolean; }) {
    const icons = Object.entries(statusMap).map(([platform, status]) => (
        <PlatformIcon
            key={platform}
            platform={platform as Platform}
            status={status}
            small={small}
        />
    ));

    if (!icons.length) return null;

    return (
        <span
            className="vc-platform-indicator"
            style={{ gap: "2px" }}
        >
            {icons}
        </span>
    );
}


function renderPlatformIndicators(user: User, small: boolean) {
    if (!user || user.bot) return null;
    if (user.id === AuthenticationStore.getId()) return <CurrentUserPlatformIndicators small={small} />;
    return <OtherUserPlatformIndicators user={user} small={small} />;
}

function CurrentUserPlatformIndicators({ small }: { small: boolean; }) {
    const statusMap = useStateFromStores([SessionsStore], getOwnStatus);
    return statusMap ? <PlatformIndicators statusMap={statusMap} small={small} /> : null;
}

function OtherUserPlatformIndicators({ user, small = false }: { user: User; small?: boolean; }) {
    const statusMap = useStateFromStores([PresenceStore], () => PresenceStore.getClientStatus(user.id));
    return statusMap ? <PlatformIndicators statusMap={statusMap} small={small} /> : null;
}


export default definePlugin({
    name: "PlatformIndicators",
    description: "Adds platform indicators (Desktop, Mobile, Web...) to users",
    tags: ["Appearance"],
    authors: [Devs.kemo, Devs.TheSun, Devs.Nuckyz, Devs.Ven],
    dependencies: ["MessageDecorationsAPI", "MemberListDecoratorsAPI"],
    settings,

    start() {
        Object.entries(indicatorLocations).forEach(([key, value]) => {
            if (settings.store[key]) value.onEnable();
        });
    },

    stop() {
        Object.entries(indicatorLocations).forEach(([_, value]) => {
            value.onDisable();
        });
    },

    patches: [
        {
            find: ".Masks.STATUS_ONLINE_MOBILE",
            predicate: () => settings.store.colorMobileIndicator,
            replacement: [
                {
                    // Return the STATUS_ONLINE_MOBILE mask if the user is on mobile, no matter the status
                    match: /\.STATUS_TYPING;switch(?=.+?(if\(\i\)return \i\.\i\.Masks\.STATUS_ONLINE_MOBILE))/,
                    replace: ".STATUS_TYPING;$1;switch"
                },
                {
                    // Return the STATUS_ONLINE_MOBILE mask if the user is on mobile, no matter the status
                    match: /switch\(\i\)\{case \i\.\i\.ONLINE:(if\(\i\)return\{[^}]+\})/,
                    replace: "$1;$&"
                }
            ]
        },
        {
            find: ".AVATAR_STATUS_MOBILE_16;",
            predicate: () => settings.store.colorMobileIndicator,
            replacement: [
                {
                    // Return the AVATAR_STATUS_MOBILE size mask if the user is on mobile, no matter the status
                    match: /\i===\i\.\i\.ONLINE&&(?=.{0,70}\.AVATAR_STATUS_MOBILE_16;)/,
                    replace: ""
                },
                {
                    // Fix sizes for mobile indicators which aren't online
                    match: /(?<=\(\i\.status,)(\i)(?=,\{.{0,15}isMobile:(\i))/,
                    replace: '$2?"online":$1'
                },
                {
                    // Make isMobile true no matter the status
                    match: /(?<=\i&&!\i)&&\i===\i\.\i\.ONLINE/,
                    replace: ""
                }
            ]
        },
        {
            find: "}isMobileOnline(",
            predicate: () => settings.store.colorMobileIndicator,
            replacement: {
                // Make isMobileOnline return true no matter what is the user status
                match: /(?<=\i\[\i\.\i\.MOBILE\])===\i\.\i\.ONLINE/,
                replace: "!= null"
            }
        }
    ]
});
