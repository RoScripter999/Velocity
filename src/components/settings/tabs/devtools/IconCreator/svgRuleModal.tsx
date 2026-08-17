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

import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import type { ModalPropsRender } from "@velocity-types";
import { Modal, Select, TextInput, useState } from "@webpack/common";

import type { SvgElement, SvgRule } from "./types";
import { normalizeSvgByType } from "./utils";

interface Props extends ModalPropsRender {
    svg: SvgElement;
    onSave: (path: SvgElement) => void;
}

export function SvgRuleModal({ svg, onSave, ...modalProps }: Props) {
    const [type, setType] = useState<SvgElement["type"]>(svg.type);
    const [fill, setFill] = useState(svg.fill || "currentColor");
    const [rule, setRule] = useState<"none" | SvgRule>(svg.fillRule || svg.clipRule || "none");

    const handleSave = () => {
        const updated: SvgElement = {
            ...normalizeSvgByType(svg, type),
            fill: fill || "",
            fillRule: rule !== "none" ? rule : undefined,
            clipRule: rule !== "none" ? rule : undefined
        };

        onSave(updated);
        modalProps.onClose();
    };

    return (
        <Modal title="Element Settings" subtitle="Configure SVG element properties" actions={[
            {
                text: "Cancel",
                variant: "secondary",
                onClick: modalProps.onClose
            },
            {
                text: "Save",
                variant: "primary",
                onClick: handleSave
            }
        ]}
            {...modalProps}>
            <div>
                <Flex flexDirection="column" gap={16} className={Margins.bottom20}>
                    <div>
                        <Select
                            label="Element Type"
                            options={[
                                { label: "Path", value: "path" },
                                { label: "Circle", value: "circle" },
                                { label: "Polygon", value: "polygon" }
                            ]}
                            formatOption={option => ({ ...option, id: option.value })}
                            value={type}
                            onSelectionChange={setType}
                        />
                    </div>

                    <div>
                        <TextInput
                            label="Fill Color"
                            value={fill}
                            onChange={setFill}
                            placeholder="currentColor"
                        />
                    </div>

                    <div>
                        <Select
                            label="Fill/Clip Rule"
                            options={[
                                { label: "None", value: "none" },
                                { label: "Even-Odd", value: "evenodd" },
                                { label: "Non-Zero", value: "nonzero" }
                            ]}
                            value={rule}
                            onSelectionChange={setRule}
                            formatOption={option => ({ ...option, id: option.value })}
                        />
                    </div>
                </Flex>
            </div>
        </Modal>
    );
}
