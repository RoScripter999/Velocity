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

import "./ui/styles.css";

import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { UserStore } from "@webpack/common";

import { CDN_URL, RAW_SKU_ID, SKU_ID } from "./lib/constants";
import { useAuthorizationStore } from "./lib/stores/AuthorizationStore";
import { useCurrentUserDecorationsStore } from "./lib/stores/CurrentUserDecorationsStore";
import { useUserDecorAvatarDecoration, useUsersDecorationsStore } from "./lib/stores/UsersDecorationsStore";
import { settings } from "./settings";
import { setAvatarDecorationModalPreview, setDecorationGridDecoration, setDecorationGridItem } from "./ui/components";
import DecorSection from "./ui/components/DecorSection";

export interface AvatarDecoration {
    asset: string;
    skuId: string;
}

export default definePlugin({
    name: "Decor",
    description: "Create and use your own custom avatar decorations, or pick your favorite from the presets.",
    tags: ["Appearance", "Customisation"],
    authors: [Devs.FieryFlames],
    patches: [
        // Patch MediaResolver to return correct URL for Decor avatar decorations
        {
            find: "getAvatarDecorationURL:",
            replacement: {
                match: /(?<=function \i\((\i)\){)(?=.{0,20}let{avatarDecoration)/,
                replace: "const vcDecorDecoration=$self.getDecorAvatarDecorationURL($1);if(vcDecorDecoration)return vcDecorDecoration;"
            }
        },
        // Patch profile customization settings to include Decor section
        {
            find: "DefaultCustomizationSections",
            lazy: true,
            replacement: {
                match: /(?<=#{intl::USER_SETTINGS_AVATAR_DECORATION}\)},"decoration"\),)/,
                replace: "$self.DecorSection(),"
            }
        },
        // Decoration modal module
        {
            find: "80,onlyAnimateOnHoverOrFocus:!",
            lazy: true,
            replacement: [
                {
                    match: /(?=function (\i)\(\i\){let{children.{20,200}isSelected:\i,\.\.\.\i\}=\i)/,
                    replace: "$self.DecorationGridItem=$1;"
                },
                {
                    match: /(?<=(?:(\i)=)?)(?:\i=>|function (\i)\(\i\)){let{user:\i,avatarDecoration/,
                    replace: (m, arrowFunctionName, functionName) => `$self.DecorationGridDecoration=${arrowFunctionName ?? functionName}${arrowFunctionName ? "" : ";"}${m}`
                },
                // Remove NEW label from decor avatar decorations
                {
                    match: /(?<=\i\.PURCHASE)(?=,)(?<=avatarDecoration:(\i).+?)/,
                    replace: "||$1.skuId===$self.SKU_ID"
                }
            ]
        },
        {
            find: "isAvatarDecorationAnimating:",
            group: true,
            replacement: [
                // Add Decor avatar decoration hook to avatar decoration hook
                {
                    match: /(?<=\.avatarDecoration,guildId:\i\}\)\),)(?<=user:(\i).+?)/,
                    replace: "vcDecorAvatarDecoration=$self.useUserDecorAvatarDecoration($1),"
                },
                // Use added hook
                {
                    match: /(?<={avatarDecoration:).{1,20}?(?=,)(?<=avatarDecorationOverride:(\i).+?)/,
                    replace: "$1??vcDecorAvatarDecoration??($&)"
                },
                // Make memo depend on added hook
                {
                    match: /(?<=size:\i}\),\[)/,
                    replace: "vcDecorAvatarDecoration,"
                }
            ]
        },
        // Current user area, at bottom of channels/dm list
        {
            find: "#{intl::USER_PROFILE_ACCOUNT_POPOUT_BUTTON_A11Y_LABEL}",
            replacement: [
                // Use Decor avatar decoration hook
                {
                    match: /(?<=\i\)\({avatarDecoration:)\i(?=,)(?<=currentUser:(\i).+?)/,
                    replace: "$self.useUserDecorAvatarDecoration($1)??$&"
                }
            ]
        },
        ...[
            "#{intl::COLLECTIBLES_NAMEPLATE_PREVIEW_A11Y}", // Nameplate preview
            "#{intl::COLLECTIBLES_PROFILE_PREVIEW_A11Y}" // Avatar preview
        ].map(find => ({
            find,
            replacement: {
                match: /(?<=userValue:)((\i(?:\.author)?)\?\.avatarDecoration)/,
                replace: "$self.useUserDecorAvatarDecoration($2)??$1"
            }
        })),
        // Patch avatar decoration preview to display Decor avatar decorations as if they are purchased
        {
            find: "#{intl::PREMIUM_UPSELL_PROFILE_AVATAR_DECO_INLINE_UPSELL_DESCRIPTION}",
            lazy: true,
            replacement: [
                {
                    match: /(?<==)function\(\i\){let{user:\i,guildId:\i,avatarDecoration:/,
                    replace: "$self.AvatarDecorationModalPreview=$&"
                }
            ]
        }
    ],
    settings,

    set AvatarDecorationModalPreview(e: any) {
        setAvatarDecorationModalPreview(e);
    },

    flux: {
        CONNECTION_OPEN: () => {
            useAuthorizationStore.getState().init();
            useCurrentUserDecorationsStore.getState().clear();
            useUsersDecorationsStore.getState().fetch(UserStore.getCurrentUser().id, true);
        },
        USER_PROFILE_MODAL_OPEN: data => {
            useUsersDecorationsStore.getState().fetch(data.userId, true);
        }
    },

    set DecorationGridItem(e: any) {
        setDecorationGridItem(e);
    },

    set DecorationGridDecoration(e: any) {
        setDecorationGridDecoration(e);
    },

    SKU_ID,
    RAW_SKU_ID,

    useUserDecorAvatarDecoration,

    async start() {
        useUsersDecorationsStore.getState().fetch(UserStore.getCurrentUser().id, true);
    },

    getDecorAvatarDecorationURL({ avatarDecoration, canAnimate }: { avatarDecoration: AvatarDecoration | null; canAnimate?: boolean; }) {
        // Only Decor avatar decorations have this SKU ID
        if (avatarDecoration?.skuId === SKU_ID) {
            const parts = avatarDecoration.asset.split("_");
            // Remove a_ prefix if it's animated and animation is disabled
            if (avatarDecoration.asset.startsWith("a_") && !canAnimate) parts.shift();
            return `${CDN_URL}/${parts.join("_")}.png`;
        } else if (avatarDecoration?.skuId === RAW_SKU_ID) {
            return avatarDecoration.asset;
        }
    },

    DecorSection: ErrorBoundary.wrap(DecorSection, { noop: true })
});
