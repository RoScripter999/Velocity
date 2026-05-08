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

import { get, set } from "@api/DataStore";
import { CodeBlock } from "@components/CodeBlock";
import { Flex } from "@components/Flex";
import { HeadingTertiary } from "@components/Heading";
import { Icon } from "@components/Icons";
import { Margins } from "@components/margins";
import { SettingsTab } from "@components/settings/tabs/SectionSettings";
import { copyWithToast } from "@utils/discord";
import { openModal } from "@utils/modal";
import { Buttons, Forms, Icons, Text, TextArea, TextInput, useEffect, useMemo, useState } from "@webpack/common";

import { SectionHeader } from "../../SectionHeader";
import { SvgRuleModal } from "./svgRuleModal";
import type { SvgElement } from "./types";
import { generateCode, getSvgPrimaryValue, makeEmptySvg, renderElement, setSvgPrimaryValue, validateSvg } from "./utils";

const STORE_KEY = "IconCreator";

const DEFAULT_STATE = {
    svgs: [makeEmptySvg()],
    viewBox: "0 0 24 24",
    width: "24",
    height: "24"
};

function getPlaceholder(type: SvgElement["type"]): string {
    switch (type) {
        case "path": return "Path data (d)";
        case "circle": return "Radius (r)";
        case "polygon": return "Points (x,y ...)";
        default: return "";
    }
}

function IconCreator() {
    const [svgs, setSvgs] = useState<SvgElement[]>(DEFAULT_STATE.svgs);
    const [viewBox, setViewBox] = useState(DEFAULT_STATE.viewBox);
    const [width, setWidth] = useState(DEFAULT_STATE.width);
    const [height, setHeight] = useState(DEFAULT_STATE.height);
    const [errors, setErrors] = useState<Record<number, string>>({});

    const generatedCode = useMemo(() => generateCode(svgs, width, height, viewBox), [svgs, width, height, viewBox]);

    useEffect(() => {
        (async () => {
            const saved = await get(STORE_KEY);
            if (saved) {
                if (Array.isArray(saved.svgs) && saved.svgs.length) setSvgs(saved.svgs);
                if (saved.viewBox) setViewBox(saved.viewBox);
                if (saved.width) setWidth(saved.width);
                if (saved.height) setHeight(saved.height);
            }
        })();
    }, []);

    useEffect(() => {
        set(STORE_KEY, { svgs, viewBox, width, height });

        const newErrors: Record<number, string> = {};
        svgs.forEach((svg, i) => {
            const err = validateSvg(svg);
            if (err) newErrors[i] = err;
        });
        setErrors(newErrors);
    }, [svgs, viewBox, width, height]);

    const handleSvgChange = (index: number, value: string) => {
        setSvgs(prev => prev.map((svg, i) => i === index ? setSvgPrimaryValue(svg, value) : svg));
    };

    const addSvg = () => setSvgs(prev => [...prev, makeEmptySvg()]);
    const removeSvg = (index: number) => setSvgs(prev => prev.filter((_, i) => i !== index));

    const openSettings = (svg: SvgElement, index: number) => {
        openModal(props => (
            <SvgRuleModal
                svg={svg}
                onSave={updated => setSvgs(prev => {
                    const next = [...prev];
                    next[index] = updated;
                    return next;
                })}
                onClose={props.onClose}
                transitionState={props.transitionState}
            />
        ));
    };

    const hasElements = svgs.some(svg => getSvgPrimaryValue(svg).trim().length > 0);
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <SettingsTab>
            <SectionHeader tag="h4" title="Icon Dimensions" />

            <Flex gap={8} className={Margins.top8}>
                <TextInput label="Width" type="number" value={width} onChange={setWidth} placeholder="24" />
                <TextInput label="Height" type="number" value={height} onChange={setHeight} placeholder="24" />
                <TextInput
                    label="ViewBox"
                    value={viewBox}
                    onChange={v => /^[\d\s\-]*$/.test(v) && setViewBox(v)}
                    placeholder="0 0 24 24"
                />
            </Flex>

            <Forms.FormDivider gap={24} />

            <SectionHeader tag="h4" title="SVG Elements" description="Define the shapes for your custom icon." margin="bottom8" />

            <Flex flexDirection="column" gap={8}>
                {svgs.map((svg, index) => (
                    <Flex key={index} gap={8} alignItems="flex-start">
                        <div style={{ flex: 1 }}>
                            <TextArea
                                value={getSvgPrimaryValue(svg)}
                                onChange={v => handleSvgChange(index, v)}
                                placeholder={getPlaceholder(svg.type)}
                                error={errors[index]}
                                rows={1}
                            />
                        </div>
                        <Buttons.IconButton
                            variant="secondary"
                            onClick={() => openSettings(svg, index)}
                            icon={() => <Icons.SettingsIcon color="currentColor" />}
                        />
                        {svgs.length > 1 && (
                            <Buttons.IconButton
                                variant="critical-secondary"
                                onClick={() => removeSvg(index)}
                                icon={() => <Icons.TrashIcon color="currentColor" />}
                            />
                        )}
                    </Flex>
                ))}
            </Flex>

            <div className={Margins.top16}>
                <Buttons.Button
                    onClick={addSvg}
                    icon={Icons.PlusMediumIcon}
                    size="sm"
                    text="Add Element"
                    disabled={svgs.some(svg => !getSvgPrimaryValue(svg).trim())}
                />
            </div>

            {hasElements && (
                <>
                    <Forms.FormDivider gap={24} />

                    <HeadingTertiary>Preview</HeadingTertiary>
                    <Flex
                        alignItems="center"
                        justifyContent="center"
                        style={{
                            minHeight: 200,
                            background: "var(--background-secondary)",
                            borderRadius: 8,
                            marginTop: 8
                        }}
                    >
                        {hasErrors ? (
                            <Text color="text-muted">Fix errors to see preview</Text>
                        ) : (
                            <Icon
                                width={Number(width) * 8}
                                height={Number(height) * 8}
                                viewBox={viewBox}
                                fill="currentColor"
                            >
                                {svgs.map((svg, i) => renderElement(svg, i))}
                            </Icon>
                        )}
                    </Flex>

                    <HeadingTertiary className={Margins.top20}>Generated Code</HeadingTertiary>
                    {hasErrors ? (
                        <Flex gap={8} alignItems="center" className={Margins.top8}>
                            <Icons.CircleErrorIcon size="sm" color="var(--text-feedback-critical)" />
                            <Text color="text-feedback-critical">Invalid SVG data</Text>
                        </Flex>
                    ) : (
                        <div className={Margins.top8}>
                            <CodeBlock lang="tsx" content={generatedCode} />
                            <Buttons.Button
                                text="Copy to Clipboard"
                                size="sm"
                                icon={Icons.CopyIcon}
                                onClick={() => copyWithToast(generatedCode)}
                            />
                        </div>
                    )}
                </>
            )}
        </SettingsTab>
    );
}

export default (IS_DEV ? IconCreator : null) as any;
