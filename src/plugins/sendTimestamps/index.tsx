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

import "./styles.css";

import { ChatBarButton, type ChatBarButtonFactory } from "@api/ChatButtons";
import { definePluginSettings } from "@api/Settings";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getTheme, insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";
import type { ModalPropsRender } from "@velocity-types";
import { Theme } from "@velocity-types/enums";
import { Forms, Icons, Modal, openModal, Parser, Select, useMemo, useState } from "@webpack/common";

const settings = definePluginSettings({
    replaceMessageContents: {
        description: "Replace timestamps in message contents",
        type: OptionType.BOOLEAN,
        default: true
    }
});

function parseTime(time: string) {
    const cleanTime = time.slice(1, -1).replace(/(\d)(AM|PM)$/i, "$1 $2");

    let ms = new Date(`${new Date().toDateString()} ${cleanTime}`).getTime() / 1000;
    if (isNaN(ms)) return time;

    // add 24h if time is in the past
    if (Date.now() / 1000 > ms) ms += 86400;

    return `<t:${Math.round(ms)}:t>`;
}

const Formats = ["", "t", "T", "d", "D", "f", "F", "s", "S", "R"] as const;
type Format = typeof Formats[number];

const cl = classNameFactory("vc-st-");

function PickerModal(props: ModalPropsRender) {
    const [value, setValue] = useState<string>();
    const [format, setFormat] = useState<Format>("");
    const time = Math.round((new Date(value!).getTime() || Date.now()) / 1000);

    const formatTimestamp = (time: number, format: Format) => `<t:${time}${format && `:${format}`}>`;

    const [formatted, rendered] = useMemo(() => {
        const formatted = formatTimestamp(time, format);
        return [formatted, Parser.parse(formatted)];
    }, [time, format]);

    return (
        <Modal
            {...props}
            title="Timestamp Picker"
            actions={[{
                text: "Insert",
                variant: "primary",
                onClick() {
                    insertTextIntoChatInputBox(formatted + " ");
                    props.onClose();
                }
            }]}
        >
            <input
                className={cl("date-picker")}
                type="datetime-local"
                value={value}
                onChange={e => setValue(e.currentTarget.value)}
                style={{
                    colorScheme: getTheme() === Theme.LIGHT ? "light" : "dark"
                }}
            />

            <div className={cl("format-select")}>
                <Select
                    label="Timestamp Format"
                    options={
                        Formats.map(m => ({
                            label: m,
                            value: m,
                            id: m
                        }))
                    }
                    value={format}
                    onSelectionChange={setFormat}
                    formatOption={options => ({
                        ...options,
                        label: Parser.parse(formatTimestamp(time, options.value))
                    })}
                />
            </div>

            <Forms.FormTitle className={Margins.bottom8}>Preview</Forms.FormTitle>
            <Paragraph className={cl("preview-text")}>
                {rendered} ({formatted})
            </Paragraph>
        </Modal>
    );
}

const SendTimestampButton: ChatBarButtonFactory = ({ isAnyChat }) => {
    if (!isAnyChat) return null;

    return (
        <ChatBarButton
            tooltip="Insert Timestamp"
            onClick={() => openModal(props => <PickerModal {...props} />)}
            buttonProps={{ "aria-haspopup": "dialog" }}
        >
            <Icons.CalendarIcon color="currentColor" />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "SendTimestamps",
    description: "Send timestamps easily via chat box button & text shortcuts. Read the extended description!",
    tags: ["Chat", "Commands"],
    authors: [Devs.Ven, Devs.Tyler, Devs.Grzesiek11],
    settings,

    chatBarButton: {
        icon: () => Icons.CalendarIcon,
        render: SendTimestampButton
    },

    onBeforeMessageSend(_, msg) {
        if (settings.store.replaceMessageContents) {
            msg.content = msg.content.replace(/`\d{1,2}:\d{2} ?(?:AM|PM)?`/gi, parseTime);
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
                <Paragraph>
                    To quickly send send time only timestamps, include timestamps formatted as `HH:MM` (including the backticks!) in your message
                </Paragraph>
                <Paragraph>
                    See below for examples.
                    If you need anything more specific, use the Date button in the chat bar!
                </Paragraph>
                <Paragraph>
                    Examples:
                    <ul>
                        {samples.map(s => (
                            <li key={s}>
                                <code>{s}</code> {"->"} {Parser.parse(parseTime(s))}
                            </li>
                        ))}
                    </ul>
                </Paragraph>
            </>
        );
    }
});
