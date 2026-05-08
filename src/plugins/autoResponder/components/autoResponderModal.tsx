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
import { FormSwitch } from "@components/FormSwitch";
import { Rule } from "@plugins/autoResponder/pluginSettings";
import { getIntlMessage } from "@utils/discord";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize } from "@utils/modal";
import { Buttons, Field, FlexClasses, Text, TextInput, useState } from "@webpack/common";

export function RuleSettingsModal({ rule, onSave, onClose, transitionState }: { rule: Rule; onSave: (rule: Rule) => void; onClose: () => void; transitionState: any; }) {
    const [caseSensitive, setCaseSensitive] = useState(rule.caseSensitive ?? false);
    const [matchWholeWord, setMatchWholeWord] = useState(rule.matchWholeWord ?? false);
    const [ruleCooldown, setRuleCooldown] = useState<number>(rule.ruleCooldown ?? 0);
    const [responseCooldown, setResponseCooldown] = useState<number>(rule.responseCooldown ?? 0);

    return (
        <ModalRoot transitionState={transitionState} size={ModalSize.MEDIUM} hideShadow={false}>
            <ModalHeader justify={FlexClasses.Justify.BETWEEN}>
                <div>
                    <Text variant="heading-lg/semibold">Rule Settings</Text>
                </div>
                <ModalCloseButton onClick={onClose} />
            </ModalHeader>
            <ModalContent>
                <Flex flexDirection="column" gap="0.5em">
                    <FormSwitch
                        title="Case Sensitive"
                        description="Only match if trigger is a specific casing"
                        value={caseSensitive}
                        onChange={setCaseSensitive}
                        hideBorder
                    />
                    <FormSwitch
                        title="Match Whole Word"
                        description="Only match if trigger a whole word"
                        value={matchWholeWord}
                        onChange={setMatchWholeWord}
                        hideBorder
                    />

                    <Field
                        label="Trigger Cooldown"
                        description="Wait this many seconds before this rule can trigger again"
                    >
                        <TextInput
                            type="number"
                            value={ruleCooldown}
                            onChange={v => setRuleCooldown(Math.max(0, Number(v)))}
                            placeholder="0"
                        />
                    </Field>

                    <Field
                        label="Response Cooldown"
                        description="Wait this many seconds before any other rule can respond"
                    >
                        <TextInput
                            type="number"
                            value={responseCooldown}
                            onChange={v => setResponseCooldown(Math.max(0, Number(v)))}
                            placeholder="0"
                        />
                    </Field>
                </Flex>
            </ModalContent>
            <ModalFooter>
                <Buttons.ButtonGroup fullWidth gap="10" direction="horizontal" justify="end">
                    <Buttons.Button
                        onClick={onClose}
                        size="sm"
                        fullWidth
                        variant="secondary"
                        text={getIntlMessage("CANCEL")}
                    />
                    <Buttons.Button
                        text={getIntlMessage("SAVE_CHANGES")}
                        size="sm"
                        fullWidth
                        onClick={() => {
                            onSave({
                                ...rule,
                                caseSensitive,
                                matchWholeWord,
                                ruleCooldown: Math.max(0, ruleCooldown),
                                responseCooldown: Math.max(0, responseCooldown)
                            });
                            onClose();
                        }}
                    />
                </Buttons.ButtonGroup>
            </ModalFooter>
        </ModalRoot >
    );
}
