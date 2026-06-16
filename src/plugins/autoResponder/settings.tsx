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

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import { ExpandableCard } from "@components/ExpandableCard";
import { Flex } from "@components/Flex";
import { Paragraph } from "@components/Paragraph";
import { SectionHeader } from "@components/settings";
import { Span } from "@components/Span";
import { RuleSettingsModal } from "@plugins/autoResponder/components/autoResponderModal";
import { classNameFactory } from "@utils/css";
import { useForceUpdater } from "@utils/react";
import { OptionType } from "@utils/types";
import { Buttons, Icons, openModal, RichTooltip, TextInput, useState } from "@webpack/common";

const cl = classNameFactory("vc-autoresponder-");

export type Rule = Record<"trigger" | "response" | "onlyIfIncludes", string> & {
    caseSensitive?: boolean;
    matchWholeWord?: boolean;
    ruleCooldown?: number;
    responseCooldown?: number;
};

interface AutoResponderProps {
    title: string;
    description: string;
    rulesArray: Rule[];
    isRegex?: boolean;
}

const makeEmptyRule: () => Rule = () => ({
    trigger: "",
    response: "",
    onlyIfIncludes: "",
    caseSensitive: false,
    matchWholeWord: false
});
const makeEmptyRuleArray = () => [makeEmptyRule()];

export function stringToRegex(str: string) {
    const match = str.match(/^(\/)?(.+?)(?:\/([gimsuyv]*))?$/);
    return match
        ? new RegExp(
            match[2],
            match[3]
                ?.split("")
                .filter((char, pos, flagArr) => flagArr.indexOf(char) === pos)
                .join("")
            ?? "gi"
        )
        : new RegExp(str);
}

function renderTriggerError(trigger: string) {
    try {
        stringToRegex(trigger);
        return null;
    } catch (e) {
        return (
            <Span className={cl("err-text")}>
                {String(e)}
            </Span>
        );
    }
}

function Input({ initialValue, onChange, placeholder }: {
    placeholder: string;
    initialValue: string;
    onChange(value: string): void;
}) {
    const [value, setValue] = useState(initialValue);

    return (
        <TextInput
            placeholder={placeholder}
            value={value}
            onChange={setValue}
            spellCheck={false}
            onBlur={() => value !== initialValue && onChange(value)}
        />
    );
}

function TextRow({ label, description, value, onChange }: { label: string; description: string; value: string; onChange(value: string): void; }) {
    return (
        <>
            <RichTooltip body={description}>
                <Span weight="medium" size="md">{label}</Span>
            </RichTooltip>
            <Input
                placeholder={description}
                initialValue={value}
                onChange={onChange}
            />
        </>
    );
}

const isEmptyRule = (rule: Rule) => !rule.trigger && !rule.response;

function AutoResponder({ title, description, rulesArray, isRegex = false }: AutoResponderProps) {
    const forceUpdate = useForceUpdater();

    function onClickRemove(index: number) {
        rulesArray.splice(index, 1);
        forceUpdate();
    }

    function onChange(e: string, index: number, key: string) {
        rulesArray[index][key] = e;
        forceUpdate();
    }

    function onClickSettings(rule: Rule, index: number) {
        openModal(props => (
            <RuleSettingsModal
                {...props}
                rule={rule}
                onSave={updatedRule => {
                    rulesArray[index] = updatedRule;
                    forceUpdate();
                }}
            />
        ));
    }

    return (
        <>
            <SectionHeader title={title} description={description} />
            <Flex flexDirection="column" gap="0.5em">
                {rulesArray.map((rule, index) => {
                    const empty = isEmptyRule(rule);

                    return (
                        <ExpandableCard
                            key={index}
                            buttons={empty ? [] : [
                                { onClick: () => onClickSettings(rule, index), icon: Icons.SettingsIcon },
                                { onClick: () => onClickRemove(index), icon: Icons.TrashIcon }
                            ]}
                            render={() => (
                                <>
                                    <fieldset className={cl("input-grid")}>
                                        <TextRow
                                            label="Trigger"
                                            description={isRegex ? "The regex pattern to match" : "The text to trigger the response"}
                                            value={rule.trigger}
                                            onChange={e => onChange(e, index, "trigger")}
                                        />
                                        <TextRow
                                            label="Response"
                                            description="The text to respond with"
                                            value={rule.response}
                                            onChange={e => onChange(e, index, "response")}
                                        />
                                        <TextRow
                                            label="Only if includes"
                                            description="Only respond if the message includes this text. Optional"
                                            value={rule.onlyIfIncludes}
                                            onChange={e => onChange(e, index, "onlyIfIncludes")}
                                        />
                                    </fieldset>
                                    {isRegex && renderTriggerError(rule.trigger)}
                                </>
                            )}
                        >
                            <Paragraph variant="text-md/medium">
                                {empty ? `Empty ${isRegex ? "Regex" : ""} Rule ${index + 1}` : `Rule ${index + 1} - ${rule.trigger}`}
                            </Paragraph>
                        </ExpandableCard>
                    );
                })}
                <Buttons.Button
                    text="Add Rule"
                    size="sm"
                    onClick={() => { rulesArray.push(makeEmptyRule()); forceUpdate(); }}
                    disabled={rulesArray.length > 0 && isEmptyRule(rulesArray[rulesArray.length - 1])}
                />
            </Flex>
        </>
    );
}

export const settings = definePluginSettings({
    responder: {
        type: OptionType.COMPONENT,
        component: () => {
            settings.store.stringRules ??= makeEmptyRuleArray();
            settings.store.regexRules ??= makeEmptyRuleArray();

            return (
                <>
                    <AutoResponder
                        title="Using String"
                        description="Respond to messages that contain a specific string"
                        rulesArray={settings.store.stringRules}
                    />
                    <AutoResponder
                        title="Using Regex"
                        description="Respond to messages that match a regular expression pattern"
                        rulesArray={settings.store.regexRules}
                        isRegex
                    />
                </>
            );
        }
    },
    ignoreBots: {
        type: OptionType.BOOLEAN,
        description: "Ignore messages from bots",
        default: true
    },
    ignoreServers: {
        type: OptionType.BOOLEAN,
        description: "Ignore messages in servers",
        default: false
    },
    ignoreSelf: {
        type: OptionType.BOOLEAN,
        description: "Ignore your own messages",
        default: true
    },
    cooldown: {
        type: OptionType.SLIDER,
        description: "Global cooldown between auto responses (seconds)",
        default: 0,
        markers: [0, 1, 2, 3, 5, 10, 15, 30, 60],
        stickToMarkers: false
    }
}).withPrivateSettings<{
    stringRules: Rule[];
    regexRules: Rule[];
}>();
