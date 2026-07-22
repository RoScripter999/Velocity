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
import ErrorBoundary from "@components/ErrorBoundary";
import { Icon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { isNonNullish } from "@utils/guards";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@velocity-types";
import { AuthenticationStore, SnowflakeUtils, Tooltip } from "@webpack/common";

type FillValue = ("status-danger" | "status-warning" | "status-positive" | "text-muted");
type Fill = [FillValue, FillValue, FillValue];
type DiffKey = keyof Diff;

interface Diff {
    days: number,
    hours: number,
    minutes: number,
    seconds: number;
    milliseconds: number;
}

const DISCORD_KT_DELAY = 1471228928;

export default definePlugin({
    name: "MessageLatency",
    description: "Displays an indicator for messages that took ≥n seconds to send",
    tags: ["Chat", "Utility"],
    authors: [Devs.arHSM],

    settings: definePluginSettings({
        latency: {
            type: OptionType.NUMBER,
            description: "Threshold in seconds for latency indicator",
            default: 2
        },
        detectDiscordKotlin: {
            type: OptionType.BOOLEAN,
            description: "Detect old Discord Android clients",
            default: true
        },
        showMillis: {
            type: OptionType.BOOLEAN,
            description: "Show milliseconds",
            default: false
        },
        ignoreSelf: {
            type: OptionType.BOOLEAN,
            description: "Don't add indicator to your own messages",
            default: false
        }
    }),

    patches: [
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                match: /(message:(\i),avatar:\i,username:\(0,\i.jsxs\)\(\i.Fragment,\{children:\[)(\i&&)/,
                replace: "$1$self.Tooltip()({ message: $2 }),$3"
            }
        }
    ],

    stringDelta(delta: number, showMillis: boolean) {
        const diff: Diff = {
            days: Math.floor(delta / (60 * 60 * 24 * 1000)),
            hours: Math.floor((delta / (60 * 60 * 1000)) % 24),
            minutes: Math.floor((delta / (60 * 1000)) % 60),
            seconds: Math.floor(delta / 1000 % 60),
            milliseconds: Math.floor(delta % 1000)
        };

        const str = (k: DiffKey) => diff[k] > 0 ? `${diff[k]} ${diff[k] > 1 ? k : k.substring(0, k.length - 1)}` : null;
        const keys = Object.keys(diff) as DiffKey[];

        const ts = keys.reduce((prev, k) => {
            const s = str(k);

            return prev + (
                isNonNullish(s)
                    ? (prev !== ""
                        ? (showMillis ? k === "milliseconds" : k === "seconds")
                            ? " and "
                            : " "
                        : "") + s
                    : ""
            );
        }, "");

        return ts || "0 seconds";
    },

    latencyTooltipData(message: Message) {
        const { latency, detectDiscordKotlin, showMillis, ignoreSelf } = this.settings.store;
        const { id, nonce } = message;

        // Message wasn't received through gateway
        if (!isNonNullish(nonce)) return null;

        // Bots basically never send a nonce, and if someone does do it then it's usually not a snowflake
        if (message.author.bot) return null;

        if (ignoreSelf && message.author.id === AuthenticationStore.getId()) return null;

        let isDiscordKotlin = false;
        let delta = SnowflakeUtils.extractTimestamp(id) - SnowflakeUtils.extractTimestamp(nonce); // milliseconds
        if (!showMillis) {
            delta = Math.round(delta / 1000) * 1000;
        }

        // Old Discord Android clients have a delay of around 17 days
        // This is a workaround for that
        if (-delta >= DISCORD_KT_DELAY - 86400000) { // One day of padding for good measure
            isDiscordKotlin = detectDiscordKotlin;
            delta += DISCORD_KT_DELAY;
        }

        // Thanks dziurwa (I hate you)
        // This is when the user's clock is ahead
        // Can't do anything if the clock is behind
        const abs = Math.abs(delta);
        const ahead = abs !== delta;
        const latencyMillis = latency * 1000;

        const stringDelta = abs >= latencyMillis ? this.stringDelta(abs, showMillis) : null;

        // Also thanks dziurwa
        // 2 minutes
        const TROLL_LIMIT = 2 * 60 * 1000;

        const fill: Fill = isDiscordKotlin
            ? ["status-positive", "status-positive", "text-muted"]
            : delta >= TROLL_LIMIT || ahead
                ? ["text-muted", "text-muted", "text-muted"]
                : delta >= (latencyMillis * 2)
                    ? ["status-danger", "text-muted", "text-muted"]
                    : ["status-warning", "status-warning", "text-muted"];

        return (abs >= latencyMillis || isDiscordKotlin) ? { delta: stringDelta, ahead, fill, isDiscordKotlin } : null;
    },

    Tooltip() {
        return ErrorBoundary.wrap(({ message }: { message: Message; }) => {
            const d = this.latencyTooltipData(message);

            if (!isNonNullish(d)) return null;

            let text: string;
            if (!d.delta) {
                text = "User is suspected to be on an old Discord Android client";
            } else {
                text = (d.ahead ? `This user's clock is ${d.delta} ahead.` : `This message was sent with a delay of ${d.delta}.`) + (d.isDiscordKotlin ? " User is suspected to be on an old Discord Android client." : "");
            }

            return <Tooltip
                text={text}
                position="top"
            >
                {props => <this.Icon delta={d.delta} fill={d.fill} props={props} />}
            </Tooltip>;
        }, { noop: true });
    },

    Icon({ delta, fill, props }: {
        delta: string | null;
        fill: Fill,
        props: {
            onClick(): void;
            onMouseEnter(): void;
            onMouseLeave(): void;
            onContextMenu(): void;
            onFocus(): void;
            onBlur(): void;
            "aria-label"?: string;
        };
    }) {
        const isMuted = fill[0] === "status-positive" && fill[1] === "status-positive" && fill[2] === "text-muted";

        return <Icon
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="none"
            style={{ marginRight: "8px", verticalAlign: -1 }}
            aria-label={delta ?? "Old Discord Android client"}
            aria-hidden="false"
            {...props}
        >
            {isMuted ? (
                <path
                    fill="var(--text-muted)"
                    d="M1.3333 2C1.3333 1.8232 1.4036 1.6536 1.5286 1.5286 1.6536 1.4036 1.8232 1.3333 2 1.3333 6.6133 1.3333 10.6467 3.8 12.8667 7.48 13.0133 7.7267 12.7667 8.0533 12.4667 8.08 12.3333 8.0933 12.2 8.12 12.0667 8.16 11.9865 8.1881 11.8992 8.1889 11.8185 8.1623 11.7377 8.1359 11.668 8.0835 11.62 8.0133 9.62 4.8 6.0667 2.6667 2 2.6667 1.8232 2.6667 1.6536 2.5964 1.5286 2.4714 1.4036 2.3464 1.3333 2.1768 1.3333 2ZM10.32 10.1C10.3477 10.0529 10.3635 9.9997 10.3658 9.945 10.3681 9.8903 10.357 9.836 10.3333 9.7867 9.5539 8.2459 8.3623 6.9516 6.891 6.0477 5.4198 5.1438 3.7267 4.6657 2 4.6667 1.8232 4.6667 1.6536 4.7369 1.5286 4.8619 1.4036 4.987 1.3333 5.1565 1.3333 5.3333 1.3333 5.5101 1.4036 5.6797 1.5286 5.8047 1.6536 5.9298 1.8232 6 2 6 3.543 5.9999 5.0531 6.4461 6.3484 7.2847 7.6436 8.1234 8.6687 9.3187 9.3 10.7267 9.42 10.9867 9.7933 11.02 9.94 10.7733L10.32 10.1ZM1.3333 8.6667C1.3333 8.4899 1.4036 8.3203 1.5286 8.1953 1.6536 8.0703 1.8232 8 2 8 3.5913 8 5.1174 8.6321 6.2426 9.7573 7.3679 10.8826 8 12.4087 8 14 8 14.1768 7.9297 14.3464 7.8047 14.4714 7.6797 14.5964 7.5101 14.6667 7.3333 14.6667 7.1565 14.6667 6.9869 14.5964 6.8619 14.4714 6.7369 14.3464 6.6667 14.1768 6.6667 14 6.6667 12.7623 6.175 11.5753 5.2998 10.7002 4.4247 9.825 3.2377 9.3333 2 9.3333 1.8232 9.3333 1.6536 9.2631 1.5286 9.1381 1.4036 9.0131 1.3333 8.8435 1.3333 8.6667ZM1.3333 11.8867C1.3333 11.58 1.58 11.3333 1.8867 11.3333 3.42 11.3333 4.6667 12.58 4.6667 14.1133 4.6667 14.42 4.42 14.6667 4.1133 14.6667H2C1.8232 14.6667 1.6536 14.5964 1.5286 14.4714 1.4036 14.3464 1.3333 14.1768 1.3333 14V11.8867ZM12.06 9.7533C12.3267 9.2867 13.0133 9.2867 13.2733 9.7533L15.9133 14.3533C16.1667 14.7933 15.8333 15.3333 15.3067 15.3333H10.0267C9.5 15.3333 9.16 14.7933 9.42 14.3467L12.06 9.7467V9.7533ZM12.3667 11H12.9667C13.1667 11 13.3133 11.1733 13.3 11.3667L13.1533 12.7133C13.1467 12.82 13.04 12.8867 12.9333 12.8667 12.7575 12.8294 12.5758 12.8294 12.4 12.8667 12.2933 12.8867 12.1867 12.82 12.18 12.7133L12.04 11.3667C12.0353 11.3202 12.0405 11.2732 12.0551 11.2289 12.0698 11.1845 12.0936 11.1437 12.125 11.1091 12.1565 11.0745 12.1948 11.0469 12.2376 11.0281 12.2803 11.0093 12.3266 10.9997 12.3733 11H12.3667ZM12.6667 14.6667C12.8435 14.6667 13.0131 14.5964 13.1381 14.4714 13.2631 14.3464 13.3333 14.1768 13.3333 14 13.3333 13.8232 13.2631 13.6536 13.1381 13.5286 13.0131 13.4036 12.8435 13.3333 12.6667 13.3333 12.4899 13.3333 12.3203 13.4036 12.1953 13.5286 12.0703 13.6536 12 13.8232 12 14 12 14.1768 12.0703 14.3464 12.1953 14.4714 12.3203 14.5964 12.4899 14.6667 12.6667 14.6667Z"
                />
            ) : (
                <>
                    <path
                        fill={`var(--${fill[0]})`}
                        d="M1.3333 8.6667C1.3333 8.4899 1.4036 8.3203 1.5286 8.1953 1.6536 8.0703 1.8232 8 2 8 3.5913 8 5.1174 8.6321 6.2426 9.7573 7.3679 10.8826 8 12.4087 8 14 8 14.1768 7.9297 14.3464 7.8047 14.4714 7.6797 14.5964 7.5101 14.6667 7.3333 14.6667 7.1565 14.6667 6.9869 14.5964 6.8619 14.4714 6.7369 14.3464 6.6667 14.1768 6.6667 14 6.6667 12.7623 6.175 11.5753 5.2998 10.7002 4.4247 9.825 3.2377 9.3333 2 9.3333 1.8232 9.3333 1.6536 9.2631 1.5286 9.1381 1.4036 9.0131 1.3333 8.8435 1.3333 8.6667ZM1.3333 11.8867C1.3333 11.58 1.58 11.3333 1.8867 11.3333 3.42 11.3333 4.6667 12.58 4.6667 14.1133 4.6667 14.42 4.42 14.6667 4.1133 14.6667H2C1.8232 14.6667 1.6536 14.5964 1.5286 14.4714 1.4036 14.3464 1.3333 14.1768 1.3333 14V11.8867Z"
                    />
                    <path
                        fill={`var(--${fill[1]})`}
                        d="M2 4.6667C1.8232 4.6667 1.6536 4.7369 1.5286 4.8619 1.4036 4.987 1.3333 5.1565 1.3333 5.3333 1.3333 5.5101 1.4036 5.6797 1.5286 5.8047 1.6536 5.9298 1.8232 6 2 6 4.1217 6 6.1566 6.8429 7.6569 8.3431 9.1571 9.8435 10 11.8783 10 14 10 14.1768 10.0703 14.3464 10.1953 14.4714 10.3203 14.5964 10.4899 14.6667 10.6667 14.6667 10.8435 14.6667 11.0131 14.5964 11.1381 14.4714 11.2631 14.3464 11.3333 14.1768 11.3333 14 11.3333 11.5247 10.35 9.1507 8.5997 7.4003 6.8493 5.65 4.4754 4.6667 2 4.6667Z"
                    />
                    <path
                        fill={`var(--${fill[2]})`}
                        d="M1.3333 2a.6667.6667 90 01.6667-.6667 12.6667 12.6667 90 0112.6667 12.6667.6667.6667 90 11-1.3333 0A11.3333 11.3333 90 002 2.6667a.6667.6667 90 01-.6667-.6667Z"
                    />
                </>
            )}
        </Icon>;
    }
});
