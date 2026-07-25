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
import { Logger } from "@utils/Logger";
import { classes } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { ChannelStore, Forms, MessageActions, SnowflakeUtils, TagGroup, Text, TextInput, UserStore, useState } from "@webpack/common";
import type { KeyboardEvent } from "react";

const settings = definePluginSettings({
    prefix: {
        type: OptionType.STRING,
        description: "Prefix to trigger ghost message deletion",
        default: "!",
        componentProps: { maxLength: 1, helperText: "DO NOT use a generic character" }
    },
    ignoreServers: {
        type: OptionType.BOOLEAN,
        description: "Whether it shouldn't ghost message in guilds",
        default: false
    },
    ignoreChannels: {
        type: OptionType.COMPONENT,
        component: () => <ChannelsSettings />,
        default: [] as string[]
    }
});

function ChannelsSettings() {
    const [inputValue, setInputValue] = useState("");
    const channels = settings.store.ignoreChannels ?? [];

    const handleTag = (action: "add" | "remove", value?: string | Set<string>) => {
        if (action === "add") {
            if (!inputValue.trim()) return;

            const current = settings.store.ignoreChannels ?? [];

            if (!current.includes(inputValue)) {
                settings.store.ignoreChannels = [...current, inputValue];
                setInputValue("");
            }
        } else if (action === "remove" && value instanceof Set) {
            settings.store.ignoreChannels = settings.store.ignoreChannels.filter(id => !value.has(id));
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && SnowflakeUtils.isProbablyAValidSnowflake(inputValue)) {
            e.preventDefault();
            handleTag("add");
        }
    };

    return (
        <section>
            <TextInput
                placeholder="Add channel ID..."
                value={inputValue}
                label="Ignored Channels"
                type="number"
                helperText="Press Enter to add a channel"
                error={inputValue && !SnowflakeUtils.isProbablyAValidSnowflake(inputValue) ? "Channel ID must be a valid Snowflake" : undefined}
                onChange={setInputValue}
                onKeyDown={handleKeyDown}
            />

            {channels.filter(id => id).length > 0 && (
                <Forms.FormSection>
                    <Text className={classes(Margins.bottom8, Margins.top8)} variant="heading-md/semibold">Ignored Channels</Text>
                    <Flex gap="5px" alignItems="center" flexWrap="wrap">
                        <TagGroup
                            layout="inline"
                            items={channels.filter(id => id).map(id => ({ id, label: id }))}
                            onRemove={keys => handleTag("remove", keys)}
                        />
                    </Flex>
                </Forms.FormSection>
            )}
        </section>
    );
}

export default definePlugin({
    name: "GhostMessage",
    description: "Deletes your messages that start with a specific prefix",
    tags: ["Fun", "Friends", "Chat"],
    authors: [Devs.RoScripter999],

    settings,

    flux: {
        async MESSAGE_CREATE(event) {
            const { message } = event as { message: Message; };
            const currentUser = UserStore.getCurrentUser();

            if (message.author.id !== currentUser?.id) return;
            if (ChannelStore.getChannel(message.channel_id).guild_id && settings.store.ignoreServers) return;
            if (!message.content?.startsWith(settings.store.prefix)) return;

            if (settings.store.ignoreChannels.filter(id => id.length > 0).includes(message.channel_id)) return;

            try {
                if (!message.deleted && message.content !== null) {
                    await MessageActions.deleteMessage(message.channel_id, message.id);
                }
            } catch (e) {
                new Logger("GhostMessage").error("Failed to delete message", e);
            }
        }
    }
});
