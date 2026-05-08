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

import "./styles.css";

import { GithubIcon, IconProps } from "@components/Icons";
import { Paragraph } from "@components/Paragraph";
import { gitRemote } from "@shared/userAgent";
import { VELOCITY_GUILD_INVITE } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import { getIntlMessage, openInviteModal } from "@utils/discord";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, type ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { findByPropsLazy } from "@webpack";
import { FlexClasses, Icons, Parser, Text, Tooltip } from "@webpack/common";
import type { ComponentType, ReactNode } from "react";

import changelogData from "./Log";

const ChangeLogClasses = findByPropsLazy("image", "improved");

const cl = classNameFactory("vc-changelog-modal-");

export enum ChangelogEntryType {
    ADDED,
    FIXED,
    IMPROVED,
    PROGRESS
}

interface ChangelogEntry {
    type: ChangelogEntryType;
    title: string | string[];
    summary?: string;
    items: string[];
}

export interface ChangelogModalProps extends ModalProps {
    subtitle: string;
    banner?: { type: "VIDEO" | "IMAGE"; src: string; };
    summary?: string;
    changes?: ChangelogEntry[];
}

function Video({ src, poster }: { src: string; poster?: string; }) {
    if (src.toLowerCase().includes("youtube.com")) return <iframe src={src} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />;
    return <video src={src} poster={poster} controls />;
}

function FooterButton({ tooltip, onClick, icon: Icon }: { tooltip: string; onClick: () => void; icon: ComponentType<IconProps>; }) {
    return (
        <Tooltip text={tooltip}>
            {tooltipProps => (
                <span {...tooltipProps} className={cl("footer-buttons")} onClick={onClick}>
                    <Icon size="xs" color="currentColor" />
                </span>
            )}
        </Tooltip>
    );
}

function ChangelogModalContent({ transitionState, onClose, subtitle, banner, summary, changes }: ChangelogModalProps) {
    const items: ReactNode[] = [];

    if (banner) {
        if (banner.type === "VIDEO") {
            items.push(<Video src={banner.src} key="banner" />);
        } else if (banner.type === "IMAGE") {
            items.push(<img src={banner.src} className={ChangeLogClasses.image} key="banner" />);
        } else {
            items.push(<Text variant="eyebrow" color="text-feedback-critical">Invalid Banner Type</Text>);
        }
    }

    if (summary) items.push(<Paragraph key="summary">{Parser.parse(summary)}</Paragraph>);

    if (changes) {
        changes.forEach((entry, c) => {
            const typeNames = ["added", "fixed", "improved", "progress"];
            const className = typeNames[entry.type];

            items.push(<h2 className={ChangeLogClasses[className]} key={`title-${c}`}><strong>{entry.title}</strong></h2>);
            if (entry.summary) items.push(<Paragraph key={`summary-${c}`}>{Parser.parse(entry.summary)}</Paragraph>);
            items.push(
                <ul key={`list-${c}`}>
                    {entry.items.map((i, idx) => <li key={`item-${c}-${idx}`}>{Parser.parse(i)}</li>)}
                </ul>
            );
        });
    }

    return (
        <ModalRoot transitionState={transitionState} size={ModalSize.SMALL} hideShadow={false} className={cl("root")}>
            <ModalHeader className={cl("header", FlexClasses.Gutter.LARGE)} justify={FlexClasses.Justify.BETWEEN}>
                <div className={FlexClasses.Direction.VERTICAL} >
                    <Text variant="heading-lg/bold">{getIntlMessage("WHATS_NEW")}</Text>
                    <Paragraph color="text-muted">{subtitle}</Paragraph>
                </div>
                <ModalCloseButton onClick={onClose} />
            </ModalHeader>
            <ModalContent className={cl("content")}>
                {items}
            </ModalContent>
            <ModalFooter className={cl("footer")}>
                <FooterButton tooltip="Join our Discord" onClick={() => openInviteModal(VELOCITY_GUILD_INVITE)} icon={() => <Icons.ClydeIcon size="xs" color="currentColor" />} />
                <FooterButton tooltip="View Source Code" onClick={() => VelocityNative.native.openExternal(`https://github.com/${gitRemote}`)} icon={GithubIcon} />
                <Text variant="text-xs/normal">{getIntlMessage("FOLLOW_US_FOR_MORE_UPDATES")}</Text>
            </ModalFooter>
        </ModalRoot>
    );
}

export function openChangelogModal() {
    openModal(props => <ChangelogModalContent {...changelogData} {...props} />);
}
