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

import { CodeBlock } from "@components/CodeBlock";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { gitHash, gitRemote } from "@shared/userAgent";
import { classNameFactory } from "@utils/css";
import { getIntlMessage } from "@utils/discord";
import { copyToClipboard } from "@utils/misc";
import { findCssClassesLazy } from "@webpack";
import { Buttons, Icons, Text, useState } from "@webpack/common";

const cl = classNameFactory("vc-bcm-");
const Classes = findCssClassesLazy("wrapper", "note", "image", "text", "title");

export default function CrashMenu({ error }: { error: { stack: string; message?: string; }; }) {
    const [copied, setCopied] = useState<boolean>();

    const copyError = async () => {
        // Toasts don't work when discord has crashed so we just change the button text instead!!!
        setCopied(true);
        await copyToClipboard(error.stack);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <ErrorBoundary noop>
            <Flex justifyContent="center" alignItems="center" className={Classes.wrapper}>
                <div className={cl("crash-content")}>
                    <div className={Classes.image} />
                    <div className={Classes.text}>
                        <Paragraph tag="h2" variant="text-lg/semibold" color="text-strong" className={Classes.title}>
                            {getIntlMessage("UNSUPPORTED_BROWSER_TITLE") || "Well, this is awkward"}
                        </Paragraph>

                        <Paragraph color="text-muted" className={Classes.note}>
                            <p>Looks like Velocity has crashed!</p>
                            <p className={Margins.bottom16}>We cannot track the error so you'll have to wait for a fix.</p>

                            <p className={Margins.bottom8}>Submiting the crash log or showing a screenshot in our support server would help!</p>

                            {IS_DEV && <Paragraph color="text-feedback-warning">
                                You're on a custom build of Velocity, Asking for support is limited.
                            </Paragraph>}
                        </Paragraph>
                    </div>

                    {error?.message && (
                        <div style={{ width: "100%" }}>
                            <Text>Error Message</Text>
                            <CodeBlock content={error.message} />
                        </div>
                    )}

                    <Buttons.ButtonGroup justify="center" direction="horizontal">
                        <Buttons.Button
                            onClick={() => location.reload()}
                            icon={Icons.RetryIcon}
                            variant="secondary"
                            text={getIntlMessage("ERRORS_RELOAD")}
                            fullWidth={!error}
                        />
                        {error && (
                            <Buttons.Button
                                onClick={copyError}
                                icon={Icons.CopyIcon}
                                text={copied ? getIntlMessage("COPIED") : "Copy Error Details"}
                            />
                        )}

                    </Buttons.ButtonGroup>

                    <Text variant="text-xs/normal" color="text-muted" className={cl("crash-footer")}>
                        {gitRemote} • {gitHash}
                    </Text>
                </div>
            </Flex >
        </ErrorBoundary >
    );
}
