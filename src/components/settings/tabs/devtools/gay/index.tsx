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

import { Card } from "@components/Card";
import { Margins } from "@components/margins";
import { sleep } from "@utils/misc";
import type { ModalPropsRender } from "@velocity-types";
import { Buttons, Field, FieldSet, Icons, MultiStepModal, openModal, RichTooltip, Text, TextInput, useState } from "@webpack/common";

const accounts = [
    {
        userId: "1352787303168344095",
        password: "gay gay"
    }
];

function MultiStepWrapper(props: ModalPropsRender) {
    const [step, setStep] = useState("start");
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const validateAccount = (): boolean => {
        const accountFound = accounts.some(
            acc => acc.userId === userId && acc.password === password
        );

        if (!accountFound) {
            setError("Invalid User ID or Password.");
            return false;
        }

        setError(null);
        return true;
    };

    return (
        <MultiStepModal
            {...props}
            currentStepKey={step}
            onStepChange={next => setStep(next)}
            steps={[
                {
                    stepKey: "start",
                    modalProps: {
                        title: "Verify Account",
                        subtitle: "Start the verification flow"
                    },
                    body: <Text>Your account is outdated/new. You must verify to continue.</Text>
                },
                {
                    stepKey: "info",
                    modalProps: {
                        title: "Account Info",
                        subtitle: "Enter account info to login.",
                        notice: error ? { message: error, type: "warning" } : undefined
                    },
                    body: (
                        <FieldSet>
                            <Field label="User ID" required>
                                <TextInput
                                    value={userId}
                                    placeholder="Enter your user ID"
                                    onChange={(val: string) => {
                                        setUserId(val);
                                        if (error) setError(null);
                                    }}
                                />
                            </Field>
                            <Field label="Password" required>
                                <TextInput
                                    value={password}
                                    placeholder="Enter password"
                                    type="password"
                                    onChange={(val: string) => {
                                        setPassword(val);
                                        if (error) setError(null);
                                    }}
                                />
                            </Field>
                        </FieldSet>
                    ),
                    onNext: validateAccount,
                    nextEnabled: userId.length > 0 && password.length > 0,
                    nextButtonProps: { text: "Login" }
                }
            ]}
            onComplete={() => props.onClose()}
        />
    );
}

function openMultiStepModal() {
    const key = openModal((modalProps: ModalPropsRender) => (
        <MultiStepWrapper {...modalProps} />
    ), { contextKey: "IM SO GAY BRO" });
    console.log(key);
}

// "gay" is a quick word for development testing i use, please also use it. it's just quicker (and no im not actually gay lol)
function TestTab() {
    const [pressed, setPressed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("Debug");

    const icon = pressed ? Icons.CheckmarkLargeIcon : Icons.BugIcon;

    async function handle() {
        setLoading(true);
        setText("Debug");
        await sleep(500);
        setPressed(true);
        await sleep(1500);
        setText("Done");
        setLoading(false);
        setPressed(false);

    }

    return (
        <div>
            <div className={Margins.bottom20}>
                <Buttons.Button fullWidth loading={loading} text={text} icon={icon} disabled={loading} onClick={handle} />
            </div>

            <Buttons.ButtonGroup>
                <Buttons.Button text="Open Multistep Modal" onClick={openMultiStepModal} />

                <RichTooltip
                    title="Tooltip Title"
                    body="This is the body"
                >
                    <Buttons.Button text="Hover Me" />
                </RichTooltip>

                <FieldSet>
                    <Field label="NO PROPS">
                        <Card className="vc-settings-card">Yes this is a card!</Card>
                    </Field>


                    <Field label="PRIMARY">
                        <Card type={Card.Types.PRIMARY} className="vc-settings-card">Yes this is a card!</Card>
                    </Field>

                    <Field label="BRAND">
                        <Card type={Card.Types.BRAND} className="vc-settings-card">Yes this is a card!</Card>
                    </Field>

                    <Field label="DANGER">
                        <Card type={Card.Types.DANGER} className="vc-settings-card">Yes this is a card!</Card>
                    </Field>

                    <Field label="WARNING">
                        <Card type={Card.Types.WARNING} className="vc-settings-card">Yes this is a card!</Card>
                    </Field>

                    <Field label="SUCCESS">
                        <Card type={Card.Types.SUCCESS} className="vc-settings-card">Yes this is a card!</Card>
                    </Field>
                </FieldSet>
            </Buttons.ButtonGroup>
        </div>
    );
}

export default (!IS_STANDALONE ? TestTab : null) as any;
