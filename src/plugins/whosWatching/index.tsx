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

import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { getIntlMessage } from "@utils/discord";
import definePlugin from "@utils/types";
import { ApplicationStreamingStore, Avatar, React, RelationshipStore, Text, Tooltip, UserStore, useStateFromStores } from "@webpack/common";

interface WatchingProps {
    userIds: string[];
    guildId?: any;
}

function Watching({ userIds, guildId }: WatchingProps) {
    const users = userIds
        .map(id => UserStore.getUser(id))
        .filter(Boolean);

    return (
        <React.Fragment>
            <Text className={Margins.bottom16} variant="heading-sm/semibold">
                {getIntlMessage("SPECTATORS", { numViewers: userIds.length.toString() })}
            </Text>

            <Flex flexDirection="column" gap="6px">
                {users.map(user => (
                    <Flex key={user.id} flexDirection="row" gap="6px">
                        <Avatar src={user.getAvatarURL(guildId)} size="SIZE_16" />
                        {RelationshipStore.getNickname(user.id) || user.globalName || user.username}
                    </Flex>
                ))}
            </Flex>
        </React.Fragment>
    );
}

export default definePlugin({
    name: "WhosWatching",
    description: "Show spectators when hovering your screenshare icon",
    tags: ["Voice"],
    authors: [Devs.RoScripter999],

    patches: [
        {
            find: ".Masks.STATUS_SCREENSHARE,width:32",
            replacement: {
                match: /jsx\)\((\i\.\i),{mask:/,
                replace: "jsx)($self.component({OriginalComponent:$1}),{mask:"
            }
        }
    ],

    component: function ({ OriginalComponent }) {
        return ErrorBoundary.wrap((props: any) => {
            const stream = useStateFromStores(
                [ApplicationStreamingStore],
                () => ApplicationStreamingStore.getCurrentUserActiveStream()
            );

            if (!stream) return null;

            const viewers = ApplicationStreamingStore.getViewerIds(stream);

            if (!viewers?.length) return <OriginalComponent {...props} />;

            return (
                <Tooltip text={<Watching userIds={viewers} guildId={stream.guildId} />}>
                    {({ onMouseEnter, onMouseLeave }) => (
                        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                            <OriginalComponent {...props} />
                        </div>
                    )}
                </Tooltip>
            );
        });
    }
});
