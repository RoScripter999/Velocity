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

import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { ManaModalFooter, ManaModalHeader, ManaModalRoot } from "@utils/manaModal";
import { ModalContent } from "@utils/modal";
import { Forms, Select, TextInput, useState } from "@webpack/common";

import type { SvgElement, SvgRule } from "./types";
import { normalizeSvgByType } from "./utils";

const ELEMENT_TYPES = [
    { label: "Path", value: "path" },
    { label: "Circle", value: "circle" },
    { label: "Polygon", value: "polygon" }
] as const;

const RULE_OPTIONS = [
    { label: "None", value: "none" },
    { label: "Even-Odd", value: "evenodd" },
    { label: "Non-Zero", value: "nonzero" }
] as const;

interface Props {
    svg: SvgElement;
    onSave: (path: SvgElement) => void;
    onClose: () => void;
    transitionState: any;
}

export function SvgRuleModal({ svg, onSave, onClose, transitionState }: Props) {
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
        onClose();
    };

    return (
        <ManaModalRoot transitionState={transitionState} onClose={onClose}>
            <ManaModalHeader title="Element Settings" subtitle="Configure SVG element properties" />
            <ModalContent>
                <Flex flexDirection="column" gap={16} className={Margins.bottom20}>
                    <div>
                        <Forms.FormTitle>Element Type</Forms.FormTitle>
                        <Select
                            options={ELEMENT_TYPES}
                            isSelected={v => v === type}
                            select={setType}
                            serialize={v => v}
                        />
                    </div>

                    <div>
                        <Forms.FormTitle>Fill Color</Forms.FormTitle>
                        <TextInput
                            value={fill}
                            onChange={setFill}
                            placeholder="currentColor"
                        />
                    </div>

                    <div>
                        <Forms.FormTitle>Fill/Clip Rule</Forms.FormTitle>
                        <Select
                            options={RULE_OPTIONS}
                            isSelected={v => v === rule}
                            select={setRule}
                            serialize={v => v}
                        />
                    </div>
                </Flex>
            </ModalContent>
            <ManaModalFooter
                actions={[
                    {
                        text: "Cancel",
                        variant: "secondary",
                        onClick: onClose
                    },
                    {
                        text: "Save",
                        variant: "primary",
                        onClick: handleSave
                    }
                ]}
            />
        </ManaModalRoot>
    );
}
