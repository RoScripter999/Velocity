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
import { Margins } from "@components/margins";
import { classes } from "@utils/misc";
import type { ModalPropsRender } from "@velocity-types";
import { findCssClassesLazy } from "@webpack";
import { DateUtils, Modal, openModal, Tabs, useState } from "@webpack/common";

import { parseEditContent } from ".";

const CodeContainerClasses = findCssClassesLazy("markup", "codeContainer");
const MiscClasses = findCssClassesLazy("messageContent", "markupRtl");

export function openHistoryModal(message: any) {
    openModal(props =>
        <ErrorBoundary>
            <HistoryModal
                modalProps={props}
                message={message}
            />
        </ErrorBoundary>
    );
}

export function HistoryModal({ modalProps, message }: { modalProps: ModalPropsRender; message: any; }) {
    const [currentTab, setCurrentTab] = useState(message.editHistory.length);
    const timestamps = [message.firstEditTimestamp, ...message.editHistory.map(m => m.timestamp)];
    const contents = [...message.editHistory.map(m => m.content), message.content];

    return (
        <Modal
            {...modalProps}
            size="lg"
            title="Message Edit History"
        >
            <Tabs
                items={[
                    ...(message.firstEditTimestamp.getTime() !== message.timestamp.getTime() ? [{
                        id: "-1",
                        label: DateUtils.dateFormat(message.timestamp, "LT"),
                        panel: () => (
                            <div className={Margins.top20}>
                                This edit state was not logged so it can't be displayed.
                            </div>
                        )
                    }] : []),
                    ...timestamps.map((timestamp, index) => ({
                        id: index,
                        label: DateUtils.dateFormat(timestamp, "LT"),
                        panel: () => (
                            <div className={classes(CodeContainerClasses.markup, MiscClasses.messageContent, Margins.top20)}>
                                {parseEditContent(contents[currentTab], message)}
                            </div>
                        )
                    }))
                ]}
                selectedId={currentTab}
                onChange={item => setCurrentTab(item)}
            />
        </Modal>
    );
}
