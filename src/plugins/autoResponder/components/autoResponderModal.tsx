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

import { FormSwitch } from "@components/FormSwitch";
import { getIntlMessage } from "@utils/discord";
import type { ModalPropsRender } from "@velocity-types";
import { Modal, TextInput, useState } from "@webpack/common";

import type { Rule } from "../settings";

export function RuleSettingsModal({ rule, onSave, ...props }: { rule: Rule; onSave: (rule: Rule) => void; } & ModalPropsRender) {
    const [caseSensitive, setCaseSensitive] = useState(rule.caseSensitive ?? false);
    const [matchWholeWord, setMatchWholeWord] = useState(rule.matchWholeWord ?? false);
    const [ruleCooldown, setRuleCooldown] = useState<number>(rule.ruleCooldown ?? 0);
    const [responseCooldown, setResponseCooldown] = useState<number>(rule.responseCooldown ?? 0);

    return (
        <Modal
            {...props}
            title="Rule Settings"
            size="lg"
            actions={[
                {
                    text: getIntlMessage("CANCEL"),
                    variant: "secondary",
                    onClick: props.onClose
                },
                {
                    text: getIntlMessage("SAVE_CHANGES"),
                    onClick: () => {
                        onSave({
                            ...rule,
                            caseSensitive,
                            matchWholeWord,
                            ruleCooldown: Math.max(0, ruleCooldown),
                            responseCooldown: Math.max(0, responseCooldown)
                        });
                        props.onClose();
                    }
                }
            ]}
        >
            <div>
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
                />

                <div className="vc-autoresponder-cooldown">
                    <TextInput
                        type="number"
                        label="Trigger Cooldown"
                        description="How many seconds before this rule can trigger again"
                        fullWidth
                        value={ruleCooldown}
                        onChange={v => setRuleCooldown(Math.max(0, Number(v)))}
                        placeholder="0"
                    />
                    <TextInput
                        type="number"
                        label="Response Cooldown"
                        description="How many seconds before any other rule can respond"
                        fullWidth
                        value={responseCooldown}
                        onChange={v => setResponseCooldown(Math.max(0, Number(v)))}
                        placeholder="0"
                    />
                </div>
            </div>
        </Modal>
    );
}
