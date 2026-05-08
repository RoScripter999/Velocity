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

import { Settings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Heading } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";
import type { Theme } from "@components/settings/tabs/themeLibary";
import { classNameFactory } from "@utils/css";
import { getIntlMessage, openInviteModal, openUserProfile } from "@utils/discord";
import { classes } from "@utils/misc";
import { ModalContent, ModalFooter, type ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { humanFriendlyJoin } from "@utils/text";
import { Buttons, Icons, Text, Tooltip, useState } from "@webpack/common";
import type { ComponentType } from "react";

interface ThemeModalProps extends ModalProps {
    theme: Theme;
}

const cl = classNameFactory("vc-themes-lib-modal-");

interface RowProps {
    icon?: ComponentType<any>;
    content?: string;
    action?: () => void;
    tooltip?: string;
}

function Row({ icon: Icon, content, action, tooltip }: RowProps) {
    const icon = () => {
        if (!Icon) return null;

        const iconContent = <div className={cl("row-icon")}>
            <Icon />
        </div>;

        if (!tooltip) return iconContent;

        return (
            <Tooltip text={tooltip}>
                {props => <div {...props}>{iconContent}</div>}
            </Tooltip>
        );
    };

    return (
        <Flex
            onClick={action}
            className={classes(cl("row"), action && cl("clickable"))}
            alignItems="center"
        >
            {icon()}
            {content && <div className={cl("row-content")}>{content}</div>}
        </Flex>
    );
}
function ThemeModal(props: ThemeModalProps & { onThemeAdded?: () => void; }) {
    const { theme, onClose, onThemeAdded } = props;
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        setLoading(true);
        await VelocityNative.themes.uploadTheme(theme.name.endsWith(".css") ? theme.name : `${theme.name}.css`, theme.themeCode);
        Settings.themes.localThemes = [
            ...JSON.parse(JSON.stringify(Settings.themes.localThemes)).filter(t => t.name !== theme.name),
            { name: theme.name.endsWith(".css") ? theme.name : `${theme.name}.css`, themeActivationModes: "always", enabled: true }
        ];
        onThemeAdded?.();
        onClose();
        setLoading(false);
    };

    return (
        <ErrorBoundary>
            <ModalRoot {...props} size={ModalSize.SMALL}>
                <div className={cl("banner")}>
                    <img loading="lazy" className={cl("banner-img")} src={theme.banner} />
                    <div className={cl("author")}>
                        <div className={cl("author-mask")}>
                            <Tooltip hideOnClick={false} text={theme.author.name}>
                                {tooltipProps => (
                                    <img
                                        loading="lazy"
                                        className={cl("author-img")}
                                        src={theme.icon}
                                        {...tooltipProps}
                                    />
                                )}
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className={cl("header")}>
                    <Text variant="heading-lg/semibold">{theme.name}</Text>
                    {theme.tags?.length && (
                        <Paragraph color="text-muted">
                            {humanFriendlyJoin(theme.tags)}
                        </Paragraph>
                    )}
                </div>

                <ModalContent>
                    <div className={cl("items")}>
                        <Heading>Theme Info</Heading>
                        <Row
                            icon={Icons.ClipboardListIcon}
                            tooltip="Description"
                            content={theme.description}
                        />
                        <Row
                            icon={Icons.AngleBracketsIcon}
                            tooltip="Code"
                            content={`${theme.name}.css`}
                        />
                        <Row
                            icon={Icons.UserIcon}
                            content={theme.author.name}
                            tooltip="Author"
                            action={() => openUserProfile(String(theme.author.id))}
                        />
                        {theme.invite && (
                            <Row
                                icon={Icons.GameControllerIcon}
                                tooltip="Invite"
                                content="Server Invite Link"
                                action={() => openInviteModal(theme.invite!)}
                            />
                        )}
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Buttons.ButtonGroup gap="8" direction="horizontal">
                        <Buttons.Button
                            text={getIntlMessage("CLOSE")}
                            variant="secondary"
                            loading={loading}
                            onClick={props.onClose}
                        />
                        <Buttons.Button
                            text={getIntlMessage("DOWNLOAD")}
                            loading={loading}
                            onClick={handleUpload}
                            fullWidth
                        />
                    </Buttons.ButtonGroup>
                </ModalFooter>
            </ModalRoot>
        </ErrorBoundary>
    );
}

export function openThemeModal(theme: Theme, onThemeAdded?: () => void) {
    openModal(props => <ThemeModal {...props} theme={theme} onThemeAdded={onThemeAdded} />);
}
