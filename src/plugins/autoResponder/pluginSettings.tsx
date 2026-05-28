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
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Span } from "@components/Span";
import { RuleSettingsModal } from "@plugins/autoResponder/components/autoResponderModal";
import { classNameFactory } from "@utils/css";
import { useForceUpdater } from "@utils/react";
import { OptionType } from "@utils/types";
import { Buttons, Forms, Icons, openModal, React, TextInput, useState } from "@webpack/common";

const cl = classNameFactory("vc-autoresponder-");

export type Rule = Record<"trigger" | "response" | "onlyIfIncludes", string> & {
    caseSensitive?: boolean;
    matchWholeWord?: boolean;
    ruleCooldown?: number;
    responseCooldown?: number;
};

interface AutoResponderProps {
    title: string;
    rulesArray: Rule[];
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

    const handleBlur = () => {
        if (value !== initialValue) {
            onChange(value);
        }
    };

    return (
        <TextInput
            placeholder={placeholder}
            value={value}
            onChange={setValue}
            spellCheck={false}
            onBlur={handleBlur}
        />
    );
}

function AutoResponder({ title, rulesArray }: AutoResponderProps) {
    const isRegexRules = title === "Using Regex";
    const forceUpdate = useForceUpdater();

    function onClickRemove(index: number) {
        if (index === rulesArray.length - 1) return;
        rulesArray.splice(index, 1);
        forceUpdate();
    }

    function onChange(e: string, index: number, key: string) {
        rulesArray[index][key] = e;

        if (index === rulesArray.length - 1 && rulesArray[index].trigger && rulesArray[index].response) {
            rulesArray.push(makeEmptyRule());
        }

        if ((!rulesArray[index].trigger || !rulesArray[index].response) && index !== rulesArray.length - 1) {
            rulesArray.splice(index, 1);
        }
        forceUpdate();
    }

    function onClickSettings(rule: Rule, index: number) {
        if (!rule.trigger || !rule.response) return;

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
        <Forms.FormSection title={title} tag="h4">
            {
                rulesArray.map((rule, index) => {
                    const isEmptyRule = index === rulesArray.length - 1;

                    return (
                        <React.Fragment key={`${rule.trigger}-${index}`}>
                            <Flex className={Margins.top8} flexDirection="row" gap="0.5em" style={{ flexGrow: 1 }}>
                                <Input
                                    placeholder="Trigger"
                                    initialValue={rule.trigger}
                                    onChange={e => onChange(e, index, "trigger")}
                                />
                                <Input
                                    placeholder="Response"
                                    initialValue={rule.response}
                                    onChange={e => onChange(e, index, "response")}
                                />
                                <Input
                                    placeholder="Only if includes"
                                    initialValue={rule.onlyIfIncludes}
                                    onChange={e => onChange(e, index, "onlyIfIncludes")}
                                />
                                {!isEmptyRule && (
                                    <>
                                        <Buttons.IconButton
                                            onClick={() => onClickSettings(rule, index)}
                                            icon={() => <Icons.SettingsIcon color="currentColor" />}
                                            variant="secondary"
                                        />
                                        <Buttons.IconButton
                                            variant="secondary"
                                            icon={() => <Icons.TrashIcon color="var(--icon-feedback-critical)" />}
                                            onClick={() => onClickRemove(index)}
                                        />
                                    </>
                                )}
                            </Flex>
                            {isRegexRules && renderTriggerError(rule.trigger)}
                        </React.Fragment>
                    );

                })
            }
        </Forms.FormSection>

    );
}

export const settings = definePluginSettings({
    responder: {
        type: OptionType.COMPONENT,
        component: () => {
            const { stringRules, regexRules } = settings.use(["stringRules", "regexRules"]);

            return (
                <>
                    <AutoResponder
                        title="Using String"
                        rulesArray={stringRules}
                    />
                    <AutoResponder
                        title="Using Regex"
                        rulesArray={regexRules}
                    />
                </>
            );
        }
    },
    stringRules: {
        type: OptionType.CUSTOM,
        default: makeEmptyRuleArray()
    },
    regexRules: {
        type: OptionType.CUSTOM,
        default: makeEmptyRuleArray()
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
});
