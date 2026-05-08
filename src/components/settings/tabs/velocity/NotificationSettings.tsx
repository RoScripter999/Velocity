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

import { useSettings } from "@api/Settings";
import { ErrorCard } from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { SectionHeader } from "@components/settings";
import { identity } from "@utils/misc";
import { ModalCloseButton, ModalContent, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { Buttons, Forms, Icons, Select, Slider, Text } from "@webpack/common";

export function NotificationSection() {
    return (
        <section>
            <SectionHeader
                icon={Icons.BellIcon}
                title="Velocity Notifications"
                tooltip="This does not include Discord notifications (messages, etc)."
                tooltipIcon={false}
                description="Settings for Velocity notifications that is integrated into the client."
                tag="h2"
                margin="bottom8"
            />
            <Buttons.Button icon={Icons.SettingsIcon} variant="secondary" size="sm" text="Notification Settings" onClick={openNotificationSettingsModal} />
        </section>
    );
}

export function openNotificationSettingsModal() {
    openModal(props => (
        <ModalRoot {...props} size={ModalSize.MEDIUM}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>Notification Settings</Text>
                <ModalCloseButton onClick={props.onClose} />
            </ModalHeader>

            <ModalContent>
                <NotificationSettings />
            </ModalContent>
        </ModalRoot>
    ));
}

function NotificationSettings() {
    const settings = useSettings(["notifications.*"]).notifications;
    const isDesktopDisabled = settings.useNative === "always";

    return (
        <div style={{ padding: "1em 0", display: "flex", flexDirection: "column", gap: "var(--space-24)" }}>

            {settings.useNative !== "never" && Notification?.permission === "denied" && (
                <ErrorCard style={{ padding: "1em" }}>
                    <Flex alignItems="center" gap={8}>
                        <Icons.WarningIcon color="currentColor" size="sm" />
                        <div>
                            <Text tag="h5" variant="text-sm/semibold">Desktop notifications blocked</Text>
                            <Forms.FormText>You have denied notification permissions. Desktop notifications will not work.</Forms.FormText>
                        </div>
                    </Flex>
                </ErrorCard>
            )}

            <section>
                <SectionHeader
                    icon={Icons.BellIcon}
                    title="Notification Style"
                    description="In-app Velocity notifications or native Desktop notifications — Desktop behave like Discord pings."
                    margin="bottom8"
                    tag="h2"
                />
                <Select
                    placeholder="Notification Style"
                    options={[
                        { label: "Desktop only when Discord is unfocused", value: "not-focused", default: true },
                        { label: "Always use Desktop notifications", value: "always" },
                        { label: "Always use Velocity notifications", value: "never" }
                    ] satisfies Array<{ value: typeof settings["useNative"]; } & Record<string, any>>}
                    closeOnSelect={true}
                    select={v => settings.useNative = v}
                    isSelected={v => v === settings.useNative}
                    serialize={identity}
                />
            </section>

            <Forms.FormDivider />

            <section>
                <SectionHeader
                    icon={Icons.LocationIcon}
                    title="Position"
                    tooltip={isDesktopDisabled ? "Position only applies to Velocity notifications" : undefined}
                    tooltipIcon={false}
                    description="Where Velocity notifications appear on screen"
                    margin="bottom8"
                    tag="h2"
                />
                <Select
                    isDisabled={isDesktopDisabled}
                    placeholder="Notification Position"
                    options={[
                        { label: "Bottom Right", value: "bottom-right", default: true },
                        { label: "Top Right", value: "top-right" }
                    ] satisfies Array<{ value: typeof settings["position"]; } & Record<string, any>>}
                    select={v => settings.position = v}
                    isSelected={v => v === settings.position}
                    serialize={identity}
                />
            </section>

            <Forms.FormDivider />

            <section>
                <SectionHeader
                    icon={Icons.TimerIcon}
                    title="Timeout"
                    description="How long a Velocity notification stays visible before auto-dismissing"
                    tag="h2"
                    margin="bottom16"
                />
                <Slider
                    disabled={isDesktopDisabled}
                    markers={[0, 1000, 2500, 5000, 10_000, 20_000]}
                    minValue={0}
                    maxValue={20_000}
                    initialValue={settings.timeout}
                    onValueChange={v => settings.timeout = v}
                    onValueRender={v => (v / 1000).toFixed(2) + "s"}
                    onMarkerRender={v => (v / 1000) + "s"}
                    stickToMarkers={false}
                />
            </section>

            <Forms.FormDivider />

            <section>
                <SectionHeader
                    icon={Icons.InboxIcon}
                    title="Log Limit"
                    description="Maximum number of notifications stored in the log, older ones are removed when the limit is reached"
                    tag="h2"
                    margin="bottom16"
                />
                <Slider
                    markers={[0, 25, 50, 75, 100, 200]}
                    minValue={0}
                    maxValue={200}
                    stickToMarkers={true}
                    initialValue={settings.logLimit}
                    onValueChange={v => settings.logLimit = v}
                    onValueRender={v => v === 200 ? "∞" : v}
                    onMarkerRender={v => v === 200 ? "∞" : v}
                />
            </section>

        </div>
    );
}
