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

import "./styles.css";

import { ChatBarButton, type ChatBarButtonFactory } from "@api/ChatButtons";
import { definePluginSettings } from "@api/Settings";
import { Icon } from "@components/Icons";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { insertTextIntoChatInputBox } from "@utils/discord";
import { closeModal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, type ModalProps, ModalRoot, openModal } from "@utils/modal";
import definePlugin, { type IconComponent, OptionType } from "@utils/types";
import { Buttons, DatePicker, Forms, Parser, Select, useMemo, useState } from "@webpack/common";

const settings = definePluginSettings({
    replaceMessageContents: {
        description: "Replace timestamps in message contents",
        type: OptionType.BOOLEAN,
        default: true
    }
});

function parseTime(time: string | { year: number; month: number; day: number; hour?: number; minute?: number; }) {
    let date: Date;

    if (typeof time === "string") {
        // Parse "HH:MM" or "HH:MM AM/PM"
        const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!match) return "<t:0:t>"; // fallback if invalid

        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();

        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;

        const now = new Date();
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    } else {
        // Use DatePicker object
        const { year, month, day, hour = 0, minute = 0 } = time;
        date = new Date(year, month - 1, day, hour, minute);
    }

    const ms = Math.floor(date.getTime() / 1000);
    return `<t:${ms}:t>`;
}

const Formats = ["", "t", "T", "d", "D", "f", "F", "R"] as const;
type Format = typeof Formats[number];

const cl = classNameFactory("vc-st-");

function PickerModal({ rootProps, close }: { rootProps: ModalProps, close(): void; }) {
    const [value, setValue] = useState<any>();
    const [format, setFormat] = useState<Format>("");
    const time = Math.round((new Date(value!).getTime() || Date.now()) / 1000);

    const formatTimestamp = (time: number, format: Format) => `<t:${time}${format && `:${format}`}>`;

    const [formatted, rendered] = useMemo(() => {
        const formatted = formatTimestamp(time, format);
        return [formatted, Parser.parse(formatted)];
    }, [time, format]);

    return (
        <ModalRoot {...rootProps}>
            <ModalHeader className={cl("modal-header")}>
                <Forms.FormTitle tag="h2" className={cl("modal-title")}>
                    Timestamp Picker
                </Forms.FormTitle>

                <ModalCloseButton onClick={close} className={cl("modal-close-button")} />
            </ModalHeader>

            <ModalContent className={cl("modal-content")}>
                <div className={cl("picker")}>
                    <DatePicker
                        value={value}
                        onChange={setValue}
                    />
                </div>
                <Select
                    options={
                        Formats.map(m => ({
                            label: m,
                            value: m
                        }))
                    }
                    isSelected={v => v === format}
                    select={v => setFormat(v)}
                    label="Timestamp Format"
                    serialize={v => v}
                    renderOptionLabel={o => (
                        <div className={cl("format-label")}>
                            {Parser.parse(formatTimestamp(time, o.value))}
                        </div>
                    )}
                    renderOptionValue={() => rendered}
                />

                <Forms.FormTitle className={Margins.top16}>Preview</Forms.FormTitle>
                <Forms.FormText className={cl("preview-text")}>
                    {rendered} ({formatted})
                </Forms.FormText>
            </ModalContent>

            <ModalFooter>
                <Buttons.Button
                    text="Insert"
                    onClick={() => {
                        insertTextIntoChatInputBox(formatted + " ");
                        close();
                    }}
                />
            </ModalFooter>
        </ModalRoot>
    );
}

const SendTimestampIcon: IconComponent = ({ height = 20, width = 20, className }) => {
    return (
        <Icon
            aria-hidden="true"
            role="img"
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 24"
            style={{ scale: "1.2" }}
        >
            <g fill="none" fillRule="evenodd">
                <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" />
                <rect width="24" height="24" />
            </g>
        </Icon>
    );
};

const SendTimestampButton: ChatBarButtonFactory = ({ isMainChat }) => {
    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip="Insert Timestamp"
            onClick={() => {
                const key = openModal(props => (
                    <PickerModal
                        rootProps={props}
                        close={() => closeModal(key)}
                    />
                ));
            }}
            buttonProps={{ "aria-haspopup": "dialog" }}
        >
            <SendTimestampIcon />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "SendTimestamps",
    description: "Send timestamps easily via chat box button & text shortcuts. Read the extended description!",
    tags: ["Chat", "Commands"],
    authors: [Devs.Ven, Devs.Tyler, Devs.Grzesiek11, Devs.Veny],
    settings,

    chatBarButton: {
        icon: SendTimestampIcon,
        required: true,
        render: SendTimestampButton
    },

    onBeforeMessageSend(_, msg) {
        if (settings.store.replaceMessageContents) {
            msg.content = msg.content.replace(/`\d{1,2}:\d{2} ?(?:AM|PM)?`/gi, match => parseTime(match.slice(1, -1)));
        }
    },

    settingsAboutComponent() {
        const samples = [
            "12:00",
            "3:51",
            "17:59",
            "24:00",
            "12:00 AM",
            "0:13PM"
        ].map(s => `\`${s}\``);

        return (
            <>
                <Forms.FormText>
                    To quickly send send time only timestamps, include timestamps formatted as `HH:MM` (including the backticks!) in your message
                </Forms.FormText>
                <Forms.FormText>
                    See below for examples.
                    If you need anything more specific, use the Date button in the chat bar!
                </Forms.FormText>
                <Forms.FormText>
                    Examples:
                    <ul>
                        {samples.map(s => (
                            <li key={s}>
                                <code>{s}</code> {"->"} {Parser.parse(parseTime(s))}
                            </li>
                        ))}
                    </ul>
                </Forms.FormText>
            </>
        );
    }
});
