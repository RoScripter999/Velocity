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

import { get, set } from "@api/DataStore";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { useTimer } from "@utils/react";
import { formatDuration } from "@utils/text";
import definePlugin, { OptionType } from "@utils/types";
import { SelectedChannelStore, Toasts, useEffect, useRef, UserStore, useState } from "@webpack/common";

import alignedChatInputFix from "./alignedChatInputFix.css?managed";

const settings = definePluginSettings({
    format: {
        type: OptionType.SELECT,
        description: "The timer format. This can be any valid moment.js format",
        options: [
            { label: "30d 23:00:42s", value: "regular", default: true },
            { label: "30d 23h 00m 42s", value: "stopwatch" }
        ]
    },
    saveTimer: {
        type: OptionType.BOOLEAN,
        description: "Save timer progress across sessions",
        default: false,
        onChange(newValue: boolean) {
            if (!SelectedChannelStore.getVoiceChannelId?.()) return;
            Toasts.show({
                message: newValue
                    ? "Rejoin the call for timer saving to take effect"
                    : "Timer saving disabled",
                id: Toasts.genId(),
                type: Toasts.Type.MESSAGE,
                options: { duration: 5000, position: Toasts.Position.BOTTOM }
            });
        }
    }
});

const timerData = new Map<string, number>();

async function loadTimerData(userId: string) {
    const saved = await get<Map<string, number>>(`CallTimer_${userId}`);
    if (saved) for (const [k, v] of saved) timerData.set(k, v);
}

async function saveTimerData(userId: string) {
    await set(`CallTimer_${userId}`, timerData);
}

export default definePlugin({
    name: "CallTimer",
    description: "Adds a timer to voice calls",
    tags: ["Voice", "Utility"],
    authors: [Devs.Ven, Devs.RoScripter999],
    settings,

    managedStyle: alignedChatInputFix,

    patches: [
        {
            find: "renderConnectionStatus(){",
            replacement: [
                {
                    match: /(renderConnectionStatus\(\).{0,1000}?lineClamp:1,children:)(\i)(?=,|}\))/,
                    replace: "$1[$2,$self.renderTimer({ channelId: this?.props?.channel?.id })]"
                },
                {
                    match: /("RTCConnectionMenu".{0,200}?lineClamp:1,children:)(\i)(?=,|}\))/,
                    replace: "$1[$2,$self.renderTimer({ channelId: this?.props?.channel?.id })]"
                }
            ]
        }
    ],

    renderTimer({ channelId }: { channelId: string; }) {
        return <ErrorBoundary noop>
            <this.Timer channelId={channelId} />
        </ErrorBoundary>;
    },

    Timer({ channelId }: { channelId: string; }) {
        const [baseTime, setBaseTime] = useState(0);
        const userId = UserStore.getCurrentUser()?.id;
        const totalTimeRef = useRef(0);

        useEffect(() => {
            if (!settings.store.saveTimer || !userId) return;
            loadTimerData(userId).then(() => {
                const saved = timerData.get(channelId) ?? 0;
                if (saved > 0) setBaseTime(saved);
            });
        }, [channelId, userId]);

        const time = useTimer({ deps: [channelId] });
        totalTimeRef.current = time + baseTime;

        useEffect(() => {
            if (!settings.store.saveTimer || !userId) return;

            const interval = setInterval(() => {
                timerData.set(channelId, totalTimeRef.current);
                saveTimerData(userId);
            }, 5000);

            return () => {
                clearInterval(interval);
                timerData.set(channelId, totalTimeRef.current);
                saveTimerData(userId);
            };
        }, [userId, channelId]);

        return <p style={{ margin: 0, fontFamily: "var(--font-code)" }}>
            {formatDuration(Math.floor(totalTimeRef.current / 1000), "seconds", true, settings.store.format as "regular" | "stopwatch")}
        </p>;
    }
});
