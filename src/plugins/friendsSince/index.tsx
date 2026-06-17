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

import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { getCurrentChannel } from "@utils/discord";
import definePlugin from "@utils/types";
import { findByCodeLazy, findComponentByCodeLazy, findCssClassesLazy } from "@webpack";
import { i18n, Icons, RelationshipStore, Text } from "@webpack/common";

const WrapperClasses = findCssClassesLazy("memberSinceWrapper");
const ContainerClasses = findCssClassesLazy("memberSince");
const getCreatedAtDate = findByCodeLazy('month:"short",day:"numeric"');
const Section = findComponentByCodeLazy("headingVariant:", '"section"', "headingIcon:");

export default definePlugin({
    name: "FriendsSince",
    description: "Shows when you became friends with someone in the user popout",
    tags: ["Friends"],
    authors: [Devs.Elvyra, Devs.Antti],
    patches: [
        // DM User Sidebar
        {
            find: "#{intl::USER_PROFILE_BIO}),headingColor",
            lazy: true,
            replacement: {
                match: /#{intl::USER_PROFILE_MEMBER_SINCE}\),.{0,100}userId:(\i\.id)}\)}\)/,
                replace: "$&,$self.FriendsSinceComponent({userId:$1,isSidebar:true})"
            }
        },
        // User Profile Modal
        {
            find: ",applicationRoleConnection:",
            lazy: true,
            replacement: {
                match: /#{intl::USER_PROFILE_MEMBER_SINCE}\),.{0,100}userId:(\i\.id),.{0,100}}\)}\),/,
                replace: "$&,$self.FriendsSinceComponent({userId:$1,isSidebar:false}),"
            }
        },
        // User Profile Modal v2
        {
            find: ".MODAL_V2,onClose:",
            lazy: true,
            noWarn: true,
            replacement: {
                match: /#{intl::USER_PROFILE_MEMBER_SINCE}\),.{0,100}userId:(\i\.id),.{0,100}}\)}\),/,
                replace: "$&,$self.FriendsSinceComponent({userId:$1,isSidebar:false}),"
            }
        }
    ],

    FriendsSinceComponent: ErrorBoundary.wrap(({ userId, isSidebar }: { userId: string; isSidebar: boolean; }) => {
        if (!RelationshipStore.isFriend(userId)) return null;

        const friendsSince = RelationshipStore.getSince(userId);
        if (!friendsSince) return null;

        return (
            <Section heading="Friends Since" headingColor={isSidebar ? "text-strong" : undefined} headingVariant={isSidebar ? undefined : "text-xs/medium"}>
                {
                    isSidebar ? (
                        <Text variant="text-sm/normal">
                            {getCreatedAtDate(friendsSince, i18n.t.getLocale())}
                        </Text>
                    ) : (
                        <div className={WrapperClasses.memberSinceWrapper}>
                            <div className={ContainerClasses.memberSince}>
                                {!!getCurrentChannel()?.guild_id && (
                                    <Icons.FriendsIcon size="xs" />
                                )}
                                <Text variant="text-sm/normal">
                                    {getCreatedAtDate(friendsSince, i18n.t.getLocale())}
                                </Text>
                            </div>
                        </div>
                    )
                }
            </Section>
        );
    }, { noop: true })
});
