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

import { definePluginSettings, migratePluginName } from "@api/Settings";
import { ExpandableCard } from "@components/ExpandableCard";
import { Flex } from "@components/Flex";
import { Paragraph } from "@components/Paragraph";
import { SectionHeader } from "@components/settings";
import { Span } from "@components/Span";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Buttons, HelpMessage, Icons, RichTooltip, TextInput, useState } from "@webpack/common";

type WarningRule = { id: string; match: string; message: string; };

const makeEmptyRule = (): WarningRule => ({ id: Math.random().toString(36).slice(2), match: "", message: "" });
const makeEmptyRuleArray = () => [makeEmptyRule()];

const settings = definePluginSettings({
    noEveryoneWarning: {
        type: OptionType.BOOLEAN,
        description: "Suppress the @everyone and @here mention warning.",
        default: true
    },
    noTokenWarning: {
        type: OptionType.BOOLEAN,
        description: "Suppress the Discord API token warning.",
        default: true
    },
    customWarnings: {
        type: OptionType.COMPONENT,
        component: () => {
            const { warningRules } = settings.use(["warningRules"]);
            return <CustomWarningRules rulesArray={warningRules} />;
        }
    },
    warningRules: {
        type: OptionType.CUSTOM,
        default: makeEmptyRuleArray()
    }
});

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

function TextRow({ label, description, value, onChange }: {
    label: string;
    description: string;
    value: string;
    onChange(value: string): void;
}) {
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

const isEmptyRule = (rule: WarningRule) => !rule.match;

function renderRegexError(match: string) {
    const regexMatch = match.match(/^\/(.+)\/([gimsuy]*)$/);
    if (!regexMatch) return null;
    try {
        new RegExp(regexMatch[1], regexMatch[2]);
        return null;
    } catch (e) {
        return <HelpMessage messageType="danger">{String(e)}</HelpMessage>;
    }
}

function CustomWarningRules({ rulesArray }: { rulesArray: WarningRule[]; }) {
    function onClickRemove(index: number) {
        rulesArray.splice(index, 1);
    }

    function onChange(value: string, index: number, key: keyof WarningRule) {
        rulesArray[index][key] = value;
        if (!rulesArray[index].match && !rulesArray[index].message && index !== rulesArray.length - 1)
            rulesArray.splice(index, 1);
    }

    return (
        <>
            <SectionHeader
                title="Custom Warnings"
                description="Show a warning before sending a message that matches a pattern. Use /pattern/flags syntax for regex."
            />
            <Flex flexDirection="column" gap="0.5em">
                {rulesArray.map((rule, index) =>
                    <ExpandableCard
                        key={rule.id}
                        buttons={[{
                            onClick: () => onClickRemove(index),
                            icon: Icons.TrashIcon
                        }]}
                        render={() => (
                            <>
                                <fieldset className="vc-noSendWarnings-input-grid">
                                    <TextRow
                                        label="Match"
                                        description="Text or /regex/flags to match against the message"
                                        value={rule.match}
                                        onChange={v => onChange(v, index, "match")}
                                    />
                                    <TextRow
                                        label="Warning"
                                        description="The warning message shown before sending"
                                        value={rule.message}
                                        onChange={v => onChange(v, index, "message")}
                                    />
                                </fieldset>
                                {renderRegexError(rule.match)}
                            </>
                        )}
                    >
                        <Paragraph variant="text-md/medium" lineClamp={1}>
                            {isEmptyRule(rule) ? `Empty Rule ${index + 1}` : `Rule ${index + 1} — ${rule.match}`}
                        </Paragraph>
                    </ExpandableCard>
                )}
                <Buttons.Button
                    text="Add Rule"
                    onClick={() => rulesArray.push(makeEmptyRule())}
                    disabled={rulesArray.length > 0 && isEmptyRule(rulesArray[rulesArray.length - 1])}
                />
            </Flex>
        </>
    );
}

migratePluginName("NoSendWarnings", "CustomSendWarnings");
export default definePlugin({
    name: "CustomSendWarnings",
    description: "Removes the 'HOLD UP!' warnings before sending a discord token or @everyone, and supports custom send warnings",
    tags: ["Utility", "Chat", "Shortcuts"],
    searchTerms: ["NoSendWarnings"],
    authors: [Devs.RoScripter999],
    settings,

    getCustomWarnings() {
        return settings.store.warningRules.flatMap(rule => {
            if (!rule.match) return [];

            let matcher: (content: string) => boolean;
            const regexMatch = rule.match.match(/^\/(.+)\/([gimsuy]*)$/);
            if (regexMatch) {
                try {
                    const regex = new RegExp(regexMatch[1], regexMatch[2]);
                    matcher = content => regex.test(content);
                } catch {
                    return [];
                }
            } else {
                matcher = content => content.toLowerCase().includes(rule.match.toLowerCase());
            }

            return [{
                check: (content: string) => matcher(content) && { body: rule.message || "Are you sure you want to send this?" },
                analyticsType: `Custom: ${rule.match}`
            }];
        });
    },

    patches: [
        {
            find: "@Everyone Warning",
            replacement: [
                {
                    match: /check\((\i),(\i),(\i)\)\{if\(!\3/,
                    replace: "check($1,$2,$3){if($self.settings.store.noEveryoneWarning)return false;if(!$3"
                },
                {
                    match: /check:(\i)=>(!!\i\.\i\.test\(\1\))/,
                    replace: "check:$1=>!$self.settings.store.noTokenWarning&&$2"
                },
                {
                    match: /analyticsType:"API Token Warning"\}/,
                    replace: 'analyticsType:"API Token Warning"},...$self.getCustomWarnings()'
                }
            ]
        }
    ]
});
