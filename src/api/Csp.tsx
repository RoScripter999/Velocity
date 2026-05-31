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

import { Margins } from "@components/margins";
import { SectionHeader } from "@components/settings";
import type { CspRequestResult } from "@main/csp/manager";
import type { ModalPropsRender } from "@velocity-types";
import { Checkbox, HelpMessage, Modal, openModal, useState } from "@webpack/common";

function getContentTypes(directives: string[]): string[] {
    return directives
        .filter(d => d !== "connect-src")
        .map(d => {
            switch (d) {
                case "img-src": return "Images";
                case "media-src": return "Media";
                case "style-src": return "CSS & Themes";
                case "font-src": return "Fonts";
                default: return null;
            }
        })
        .filter(Boolean)
        .sort() as string[];
}

interface CspPermissionModalProps extends ModalPropsRender {
    url: string;
    directives: string[];
    callerName: string;
    resolve(result: CspRequestResult): void;
}

function CspPermissionModal({ url, directives, callerName, resolve, ...modalProps }: CspPermissionModalProps) {
    const [checked, setChecked] = useState(false);

    const domain = new URL(url).host;
    const contentTypes = getContentTypes(directives);

    return (
        <Modal
            {...modalProps}
            onClose={() => { resolve("cancelled"); modalProps.onClose(); }}
            title="Velocity Host Permissions"
            preview={
                <Checkbox
                    options={[{
                        value: "trust",
                        label: "I fully trust this domain and understand the risks of allowing connections to it."
                    }]}
                    selectedValues={checked ? ["trust"] : []}
                    onChange={values => setChecked(values.includes("trust"))}
                />
            }
            actions={[
                {
                    text: "Cancel",
                    variant: "secondary",
                    onClick: () => { resolve("cancelled"); modalProps.onClose(); }
                },
                {
                    text: "Allow This Domain",
                    variant: "critical-primary",
                    disabled: !checked,
                    onClick: async () => {
                        const result = await VelocityNative.csp.requestAddOverride(url, directives, callerName);
                        resolve(result);
                        modalProps.onClose();
                    }
                }
            ]}
        >
            <SectionHeader
                tag="h2"
                title={`${domain} wants to allow connections`}
                description="The following types of content will be allowed to load are:"
                descriptionColor="text-default"
                margin="bottom8"
            />
            {contentTypes.length > 0 && <ul style={{ listStyleType: "disc", paddingLeft: "1.5em", margin: "4px 0 0" }}>
                {contentTypes.map(type => (
                    <li key={type}>{type}</li>
                ))}
            </ul>}

            <HelpMessage messageType="warn" className={Margins.top16}>
                Unless you recognise and fully trust <strong>{domain}</strong>, you should cancel this request!
            </HelpMessage>
        </Modal>
    );
}

/**
 * Show a Velocity renderer modal asking the user to allow a new CSP domain override.
 * Replaces the old `dialog.showMessageBox` in the main process.
 *
 * @param url        The URL (origin) to allow
 * @param directives The CSP directives to enable for that domain
 * @param callerName Human-readable name of the plugin / feature requesting access
 */
export function requestCspOverride(url: string, directives: string[], callerName: string): Promise<CspRequestResult> {
    return new Promise(resolve =>
        openModal(props =>
            <CspPermissionModal
                {...props}
                url={url}
                directives={directives}
                callerName={callerName}
                resolve={resolve}
            />
        )
    );
}
