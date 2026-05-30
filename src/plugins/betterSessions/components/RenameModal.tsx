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

import type { SessionInfo } from "@plugins/betterSessions/types";
import { getDefaultName, savedSessionsCache, saveSessionsToDataStore } from "@plugins/betterSessions/utils";
import { getIntlMessage } from "@utils/discord";
import type { ModalPropsRender } from "@velocity-types";
import { Buttons, Modal, TextInput, useState } from "@webpack/common";
import type { KeyboardEvent } from "react";

export function RenameModal({ props, session, state }: { props: ModalPropsRender, session: SessionInfo["session"], state: [string, React.Dispatch<React.SetStateAction<string>>]; }) {
    const [title, setTitle] = state;
    const [value, setValue] = useState(savedSessionsCache.get(session.id_hash)?.name ?? "");

    function onSaveClick() {
        savedSessionsCache.set(session.id_hash, { name: value, isNew: false });
        if (value !== "") {
            setTitle(`${value}*`);
        } else {
            setTitle(getDefaultName(session.client_info));
        }

        saveSessionsToDataStore();
        props.onClose();
    }

    return (
        <Modal
            {...props}
            title="Rename"
            actions={[
                {
                    text: getIntlMessage("CANCEL"),
                    variant: "secondary",
                    onClick: () => props.onClose()
                },
                {
                    text: getIntlMessage("SAVE"),
                    variant: "primary",
                    onClick: onSaveClick
                }
            ]}
        >
            <div>
                <TextInput
                    style={{ marginBottom: "10px" }}
                    label="New device name"
                    placeholder={getDefaultName(session.client_info)}
                    value={value}
                    onChange={setValue}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                            onSaveClick();
                        }
                    }}
                />
                <div style={{
                    padding: "20px",
                    paddingLeft: "1px",
                    paddingRight: "1px"
                }} >
                    <Buttons.Button
                        size="sm"
                        text="Reset Name"
                        disabled={value === ""}
                        onClick={() => setValue("")}
                    />
                </div>
            </div>
        </Modal >
    );
}
