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
import { ErrorCard } from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Link } from "@components/Link";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { gitHash } from "@shared/userAgent";
import { relaunch } from "@utils/native";
import { changes, checkForUpdates, update, updateError } from "@utils/updater";
import { Buttons, ConfirmModal, Forms, Icons, LoadingIndicator, openModal, Text, Toasts, useState } from "@webpack/common";
import type { Dispatch, SetStateAction } from "react";

import { SectionHeader } from "../SectionHeader";
import { runWithDispatch } from "./runWithDispatch";

export interface CommonProps {
    repo: string;
    repoPending: boolean;
    checkingUpdate?: boolean;
    setCheckingUpdate?: Dispatch<SetStateAction<boolean>>;
}

export function HashLink({ repo, hash, disabled = false }: { repo: string; hash: string; disabled?: boolean; }) {
    return (
        <Link href={`${repo}/commit/${hash}`} disabled={disabled}>
            {hash}
        </Link>
    );
}


export function Repo(props: CommonProps & { error: any; }) {
    const { error } = props;
    return (
        <>
            <Forms.FormTitle tag="h5">Repository</Forms.FormTitle>
            <Paragraph>
                {props.repoPending ? (
                    <Flex alignItems="center" gap={6}>
                        <LoadingIndicator type="wanderingCubes" />
                        <span>Loading repository...</span>
                    </Flex>
                ) : error || !props.repo ? (
                    "Failed to retrieve - check console"
                ) : (
                    <>
                        <Link href={props.repo}>{props.repo.split("/").slice(-2).join("/")}</Link>{" "}
                        (<HashLink hash={gitHash} repo={props.repo} disabled={props.repoPending} />)
                    </>
                )}
            </Paragraph>
        </>
    );
}

export function Changes({ updates, repo, repoPending }: { updates: typeof changes; repo: string; repoPending: boolean; }) {
    return (
        <div>
            <Forms.FormTitle>Changes</Forms.FormTitle>
            <Flex flexDirection="column" gap="0.75rem">
                {updates.map(({ hash, author, message }) => (
                    <Card key={hash} style={{ padding: "0.75rem", background: "var(--background-accent)" }}>
                        <Flex>
                            <HashLink {...{ repo, hash }} disabled={repoPending} />
                            <Text variant="text-xs/normal" color="text-muted">
                                by {author}
                            </Text>
                        </Flex>
                        <Text variant="text-sm/normal">
                            {message}
                        </Text>
                    </Card>
                ))}
            </Flex>
        </div>
    );
}

export function Newer(props: CommonProps) {
    return (
        <div>
            <SectionHeader
                title="Local Changes Detected"
                description="Your local copy has more recent commits. Please stash or reset them."
                margin="bottom16"
            />
            <Changes {...props} updates={changes} />
        </div>
    );
}

export function Updatable(props: CommonProps) {
    const [updates, setUpdates] = useState(changes);
    const [isChecking, setIsChecking] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const isOutdated = (updates?.length ?? 0) > 0;

    return (
        <div>
            {!updates && updateError ? (
                <>
                    <SectionHeader
                        title="Update Check Failed"
                        description="Failed to check for updates. Check the console for more info."
                        margin="bottom8"
                    />
                    <ErrorCard className={Margins.bottom8}>
                        {updateError?.stderr || updateError?.stdout || "An unknown error occurred"}
                    </ErrorCard>
                </>
            ) : (
                <SectionHeader
                    className={Margins.bottom16}
                    title={isOutdated ? "Updates Available" : "Up to Date"}
                    description={isOutdated
                        ? updates.length === 1
                            ? "There is 1 update available."
                            : `There are ${updates.length} updates available.`
                        : "You're running the latest version of Velocity."}
                />
            )}

            {isOutdated && <Changes updates={updates} {...props} />}

            <Buttons.ButtonGroup direction="horizontal" className={Margins.top16}>
                {isOutdated && (
                    <Buttons.Button
                        variant="secondary"
                        icon={Icons.DownloadIcon}
                        loading={isUpdating}
                        disabled={isChecking}
                        text={isUpdating ? "Updating..." : "Update Now"}
                        onClick={runWithDispatch(setIsUpdating, async () => {
                            if (await update()) {
                                setUpdates([]);

                                await new Promise<void>(r => {
                                    openModal(props => (
                                        <ConfirmModal
                                            {...props}
                                            title="Update Successful"
                                            subtitle="Velocity has been updated successfully. Restart Discord to apply the changes?"
                                            confirmText="Restart Now"
                                            cancelText="Later"
                                            variant="primary"
                                            onConfirm={() => {
                                                relaunch();
                                                r();
                                            }}
                                            onCancel={r}
                                        />
                                    ));
                                });
                            }
                        })}
                    />
                )}
                <Buttons.Button
                    disabled={isChecking}
                    loading={isUpdating}
                    text={isChecking ? "Checking..." : "Check for Updates"}
                    onClick={runWithDispatch(setIsChecking, async () => {
                        const outdated = await checkForUpdates();

                        if (outdated) {
                            setUpdates(changes);
                        } else {
                            setUpdates([]);
                            Toasts.show({
                                message: "No updates found!",
                                id: Toasts.genId(),
                                type: Toasts.Type.MESSAGE,
                                options: {
                                    position: Toasts.Position.BOTTOM
                                }
                            });
                        }
                    })}
                />
            </Buttons.ButtonGroup>
        </div>
    );
}
