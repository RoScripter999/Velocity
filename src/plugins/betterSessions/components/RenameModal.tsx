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

import { getIntlMessage } from "@utils/discord";
import { ModalContent, ModalFooter, ModalHeader, type ModalProps, ModalRoot } from "@utils/modal";
import { Buttons, Forms, type React, TextInput, useState } from "@webpack/common";
import type { KeyboardEvent } from "react";

import type { SessionInfo } from "../types";
import { getDefaultName, savedSessionsCache, saveSessionsToDataStore } from "../utils";

export function RenameModal({ props, session, state }: { props: ModalProps, session: SessionInfo["session"], state: [string, React.Dispatch<React.SetStateAction<string>>]; }) {
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
        <ModalRoot {...props}>
            <ModalHeader>
                <Forms.FormTitle tag="h4">Rename</Forms.FormTitle>
            </ModalHeader>

            <ModalContent>
                <Forms.FormTitle tag="h5" style={{ marginTop: "10px" }}>New device name</Forms.FormTitle>
                <TextInput
                    style={{ marginBottom: "10px" }}
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
            </ModalContent>

            <ModalFooter>
                <div className="vc-betterSessions-footer-buttons">
                    <Buttons.Button
                        variant="secondary"
                        text={getIntlMessage("CANCEL")}
                        onClick={() => props.onClose()}
                    />
                    <Buttons.Button
                        text={getIntlMessage("SAVE")}
                        onClick={onSaveClick}
                    />
                </div>
            </ModalFooter>
        </ModalRoot >
    );
}
