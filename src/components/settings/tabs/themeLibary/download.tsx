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

import { Settings } from "@api/Settings";
import { SectionHeader } from "@components/settings";
import { classNameFactory } from "@utils/css";
import { getIntlMessage, openInviteModal, openUserProfile } from "@utils/discord";
import type { IconComponent } from "@utils/types";
import type { ModalPropsRender } from "@velocity-types";
import { Icons, Modal, Text, Tooltip, useState } from "@webpack/common";

import { BannerTryCatch, type Theme } from "./";

interface ThemeModalProps extends ModalPropsRender {
    theme: Theme;
    onThemeAdded?: () => void;
}

const cl = classNameFactory("vc-themes-lib-modal-");

interface RowProps {
    icon: IconComponent;
    label: string;
    action?: () => void;
    tooltip?: string;
}

function Row({ icon: Icon, label, action, tooltip }: RowProps) {
    return (
        <div
            onClick={action}
            className={cl("row", action && "clickable")}
        >
            {tooltip ? <Tooltip text={tooltip}>{props => <Icon color="currentColor" {...props} />}</Tooltip> : <Icon color="currentColor" />}
            <Text>{label}</Text>
        </div>
    );
}

export function ThemeModal(props: ThemeModalProps) {
    const { theme, onClose, onThemeAdded } = props;
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        setLoading(true);
        try {
            await VelocityNative.themes.uploadTheme(theme.name.endsWith(".css") ? theme.name : `${theme.name}.css`, theme.themeCode);
            Settings.themes.localThemes = [
                ...JSON.parse(JSON.stringify(Settings.themes.localThemes)).filter((t: Theme) => t.name !== theme.name),
                { name: theme.name.endsWith(".css") ? theme.name : `${theme.name}.css`, themeActivationModes: "always", enabled: true }
            ];
            onThemeAdded?.();
            setLoading(false);
            onClose();
        } catch {
            setLoading(false);
        }
    };

    return (
        <Modal title={
            <SectionHeader
                title={theme.name}
                description={theme.description}
                layout="horizontal"
                icon={() => <Tooltip hideOnClick={false} text={theme.author.name}>
                    {tooltipProps => (
                        <img
                            loading="lazy"
                            className={cl("author-img")}
                            src={theme.icon}
                            {...tooltipProps}
                        />
                    )}
                </Tooltip>} />
        } actions={[
            {
                text: getIntlMessage("CLOSE"),
                variant: "secondary",
                loading: loading,
                onClick: props.onClose
            },
            {
                text: getIntlMessage("DOWNLOAD"),
                loading: loading,
                onClick: handleUpload
            }
        ]} {...props}>
            <div>
                <section className={cl("banner")}>
                    <Text>Theme Preview</Text>
                    <BannerTryCatch className={cl("banner-img")} theme={theme} />
                </section>

                <section>
                    <Text>Theme Info</Text>
                    <Row
                        icon={Icons.AngleBracketsIcon}
                        tooltip="Code"
                        label={`${theme.name}.css`}
                    />
                    <Row
                        icon={Icons.UserIcon}
                        label={theme.author.name}
                        tooltip="Author"
                        action={Number(theme.author.id) !== 0 ? () => openUserProfile(String(theme.author.id)) : undefined}
                    />
                    {theme.invite && (
                        <Row
                            icon={Icons.GameControllerIcon}
                            tooltip="Invite"
                            label="Server Invite Link"
                            action={() => openInviteModal(theme.invite!)}
                        />
                    )}
                </section>
            </div>
        </Modal>
    );
}
