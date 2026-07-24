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

import { addServerListElement, removeServerListElement, ServerListRenderPosition } from "@api/ServerList";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { BuildPluginSettings } from "@plugins/velocityToolbox/menu";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import definePlugin, { OptionType } from "@utils/types";
import type { Channel } from "@velocity-types";
import { ActiveJoinedThreadsStore, Buttons, ChannelStore, ChannelTypeSets, FluxDispatcher, GuildChannelStore, GuildStore, Menu, Popout, React, ReadStateStore, useRef } from "@webpack/common";

const cl = classNameFactory("vc-ranb-");

const settings = definePluginSettings({
    readMode: {
        description: "Which mode should it read on",
        type: OptionType.SELECT,
        options: [
            { label: "Both", value: "BOTH", default: true },
            { label: "Only Guilds (Servers)", value: "GUILDS" },
            { label: "Only DMs", value: "DMS" }
        ]
    }
});

function onClick() {
    const channels: Array<any> = [];
    const mode = settings.store.readMode;

    if (mode === "BOTH" || mode === "GUILDS") {
        Object.values(GuildStore.getGuilds()).forEach(guild => {
            const guildChannels = GuildChannelStore.getChannels(guild.id);
            const selectable = guildChannels.SELECTABLE || [];
            const vocal = guildChannels.VOCAL || [];
            const threads = Object.values(ActiveJoinedThreadsStore.getActiveJoinedThreadsForGuild(guild.id))
                .flatMap(threadChannels => Object.values(threadChannels));

            [...selectable, ...vocal, ...threads].forEach((c: { channel: Channel; }) => {
                if (ReadStateStore.hasUnread(c.channel.id)) {
                    channels.push({
                        channelId: c.channel.id,
                        messageId: ReadStateStore.lastMessageId(c.channel.id),
                        readStateType: 0
                    });
                }
            });
        });
    }

    if (mode === "BOTH" || mode === "DMS") {
        Object.values(ChannelStore.getMutablePrivateChannels())
            .filter((channel): channel is Channel => !!channel && ChannelTypeSets.ALL_DMS.has(channel.type) && ReadStateStore.hasUnread(channel.id))
            .forEach(channel => {
                channels.push({
                    channelId: channel.id,
                    messageId: ReadStateStore.lastMessageId(channel.id),
                    readStateType: 0
                });
            });
    }

    if (channels.length) {
        FluxDispatcher.dispatch({
            type: "BULK_ACK",
            context: "APP",
            channels
        });
    }
}

function ContextMenu({ closePopout }: { closePopout: () => void; }) {
    settings.use();

    return (
        <Menu.Menu navId="read-all-context" onClose={closePopout}>
            {BuildPluginSettings(settings, true)}
        </Menu.Menu>
    );
}

const ReadAllButton = () => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    return (
        <div className={cl("button")}>
            <Popout
                position="right"
                animation={Popout.Animation.NONE}
                targetElementRef={buttonRef}
                renderPopout={({ closePopout }) => <ContextMenu closePopout={closePopout} />}
            >
                {({ onClick: openPopout }) => (
                    <Buttons.TextButton
                        buttonRef={buttonRef}
                        onClick={onClick}
                        onContextMenu={openPopout}
                        text="Read All"
                        variant="secondary"
                        textVariant="text-xs/medium"
                    />
                )}
            </Popout>
        </div>
    );
};

export default definePlugin({
    name: "ReadAllNotificationsButton",
    description: "Read all server or direct message notifications with a single button click!",
    tags: ["Notifications", "Shortcuts"],
    authors: [Devs.kemo, Devs.RoScripter999],
    dependencies: ["ServerListAPI"],
    settings,

    renderReadAllButton: ErrorBoundary.wrap(ReadAllButton, { noop: true }),

    start() {
        addServerListElement(ServerListRenderPosition.Above, this.renderReadAllButton);
    },

    stop() {
        removeServerListElement(ServerListRenderPosition.Above, this.renderReadAllButton);
    }
});
