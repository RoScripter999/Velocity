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
import { InlineCode } from "@components/CodeBlock";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getTheme, insertTextIntoChatInputBox } from "@utils/discord";
import { copyToClipboard } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import type { ModalPropsRender } from "@velocity-types";
import { Theme } from "@velocity-types/enums";
import { Buttons, Forms, Icons, Modal, openModal, Parser, Text, useMemo, useState } from "@webpack/common";

const settings = definePluginSettings({
    replaceMessageContents: {
        description: "Replace timestamps in message contents",
        type: OptionType.BOOLEAN,
        default: true
    },
    insertClosesModal: {
        description: "Closes the modal if `Insert` is pressed",
        type: OptionType.BOOLEAN,
        default: true
    }
});

function parseTime(time: string) {
    const cleanTime = time.slice(1, -1).replace(/(\d)(AM|PM)$/i, "$1 $2");

    const date = new Date(`${new Date().toDateString()} ${cleanTime}`);
    if (Number.isNaN(date.getTime())) return time;

    // tomorrow can be 23 or 25 hours away across dst changes
    if (Date.now() > date.getTime()) date.setDate(date.getDate() + 1);

    return `<t:${Math.round(date.getTime() / 1000)}:t>`;
}

const Formats = ["R", "t", "T", "d", "s", "S", "D", "f", "F"] as const;
type Format = typeof Formats[number];

const cl = classNameFactory("vc-st-");

function PickerModal(props: ModalPropsRender) {
    const [value, setValue] = useState<string>();
    const [format, setFormat] = useState<Format>("f");
    const time = Math.round((new Date(value!).getTime() || Date.now()) / 1000);

    const formatTimestamp = (time: number, format: Format) => `<t:${time}${format && `:${format}`}>`;

    const [formatted, _rendered] = useMemo(() => {
        const formatted = formatTimestamp(time, format);
        return [formatted, Parser.parse(formatted)];
    }, [time, format]);

    return (
        <Modal
            {...props}
            title="Timestamp Picker"
            size="lg"
            actions={[{
                text: "Insert",
                variant: "primary",
                onClick() {
                    insertTextIntoChatInputBox(formatted + " ");
                    if (settings.store.insertClosesModal) props.onClose();
                }
            }, {
                text: "Copy",
                variant: "secondary",
                onClick() {
                    copyToClipboard(formatted);
                    props.onClose();
                }
            }]}
        >
            <Forms.FormSection title="Time">
                <input
                    className={cl("date-picker")}
                    type="datetime-local"
                    value={value}
                    onChange={e => setValue(e.currentTarget.value)}
                    style={{
                        colorScheme: getTheme() === Theme.LIGHT ? "light" : "dark"
                    }}
                />
            </Forms.FormSection>

            <Forms.FormSection title="Format">
                <div className={cl("format-grid")}>
                    {Formats.map(m =>
                        <Buttons.Button
                            variant={format === m ? "primary" : "secondary"}
                            onClick={() => setFormat(m)}
                            size="sm"
                            key={m}
                            text={Parser.parse(formatTimestamp(time, m), true)}
                            fullWidth
                        />
                    )}
                </div>
            </Forms.FormSection>

            <Forms.FormTitle>
                Raw Markdown:
                <InlineCode className={cl("raw-code")}>{formatted}</InlineCode>
            </Forms.FormTitle>
        </Modal>
    );
}

const SendTimestampButton: ChatBarButtonFactory = ({ isAnyChat }) => {
    const [key, setKey] = useState<string>();
    if (!isAnyChat) return null;

    return (
        <ChatBarButton
            tooltip="Insert Timestamp"
            onClick={() => {
                if (key) return;

                setKey(openModal(props => <PickerModal {...props} />, { onCloseCallback: () => setKey(undefined) }));
            }}
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
                <Text>
                    To quickly send time only timestamps, include timestamps formatted as `HH:MM` (including the backticks!) in your message.
                </Text>
                <Text>
                    See below for examples.
                    If you need anything more specific, use the Date button in the chat bar!
                </Text>
                <Forms.FormDivider gap={8} />
                <Text>
                    <Forms.FormTitle>Examples</Forms.FormTitle>
                    <ul>
                        {samples.map(s => (
                            <li key={s}>
                                <InlineCode className={cl("desc-code")}>{s}</InlineCode> → {Parser.parse(parseTime(s))}
                            </li>
                        ))}
                    </ul>
                </Text>
            </>
        );
    }
});
