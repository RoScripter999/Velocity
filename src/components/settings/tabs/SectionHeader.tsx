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

import { Heading } from "@components/Heading";
import { Margins } from "@components/margins";
import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import type { HeadingTag, TextProps, TextVariant } from "@velocity-types";
import { Icons, RichTooltip, Text, Tooltip } from "@webpack/common";
import type { ComponentPropsWithoutRef, ComponentType, CSSProperties, ReactNode } from "react";

const cl = classNameFactory("vc-settings-section-header-");

interface Props {
    icon?: ComponentType<any>;
    title: ReactNode;
    tooltip?: string | ComponentPropsWithoutRef<typeof RichTooltip>;
    /** Whether the question mark icon should show from {@link tooltip}. puts tooltip in {@link title} if false. @default true. Elseif its a component ? icon would be replaced. */
    tooltipIcon?: boolean | ComponentType<any>;
    description?: ReactNode;
    /** Uses heading component @default p */
    tag?: HeadingTag | "p";
    /**
     * @param vertical Puts the icon next to the title
     * @param horizontal Puts the icon between description and title on the left side
     * @default vertical
     */
    layout?: "vertical" | "horizontal";
    margin?: keyof typeof Margins;
    className?: string;
    iconWrapperClassName?: string;
    titleVariant?: TextVariant;
    titleColor?: TextProps["color"];
    /** @default text-sm/normal */
    descriptionVariant?: TextVariant;
    /** @default text-muted */
    descriptionColor?: TextProps["color"];
    style?: CSSProperties;
}

export function SectionHeader({
    icon: Icon,
    title,
    tooltip,
    tooltipIcon = true,
    description,
    tag: Tag = "p",
    layout = "vertical",
    margin,
    className,
    iconWrapperClassName,
    titleVariant,
    titleColor,
    descriptionVariant = "text-sm/normal",
    descriptionColor = "text-muted",
    style
}: Props) {
    const tooltipText = typeof tooltip === "string" ? tooltip : undefined;
    const richTooltipProps = typeof tooltip === "object" ? tooltip : undefined;

    const TooltipIcon =
        tooltipIcon === false
            ? null
            : tooltipIcon === true || tooltipIcon === undefined
                ? Icons.CircleQuestionIcon
                : tooltipIcon;

    const titleNode = titleVariant
        ? <Text variant={titleVariant} color={titleColor}>{title}</Text>
        : titleColor
            ? <Text tag={Tag} color={titleColor} className={cl("title")}>{title}</Text>
            : <Heading tag={Tag as any} className={cl("title")}>{title}</Heading>;

    const iconNode = Icon && layout === "vertical"
        ? <Icon size="sm" color="var(--text-muted)" />
        : null;

    const titleRow = (
        <div className={cl("title-row")}>
            {tooltipText && !tooltipIcon
                ? (
                    <Tooltip text={tooltipText}>
                        {({ onMouseEnter, onMouseLeave }) => (
                            <span
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                                className={cl("title-row")}
                            >
                                {iconNode}
                                {titleNode}
                            </span>
                        )}
                    </Tooltip>
                )
                : richTooltipProps && !tooltipIcon
                    ? (
                        <RichTooltip {...richTooltipProps} asContainer>
                            <span className={cl("title-row")}>
                                {iconNode}
                                {titleNode}
                            </span>
                        </RichTooltip>
                    )
                    : <>{iconNode}{titleNode}</>
            }

            {tooltipText && TooltipIcon && (
                <Tooltip text={tooltipText}>
                    {({ onMouseEnter, onMouseLeave }) => (
                        <span
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            className={cl("tooltip")}
                        >
                            <TooltipIcon size="xs" color="currentColor" />
                        </span>
                    )}
                </Tooltip>
            )}

            {richTooltipProps && TooltipIcon && (
                <RichTooltip {...richTooltipProps} asContainer>
                    <span className={cl("tooltip")}>
                        <TooltipIcon size="xs" color="currentColor" />
                    </span>
                </RichTooltip>
            )}
        </div>
    );

    const descriptionNode = description && (
        typeof description === "string"
            ? (
                <Text variant={descriptionVariant} color={descriptionColor} className={cl("description")}>
                    {description}
                </Text>
            )
            : <div className={cl("description")}>{description}</div>
    );

    const content = <>{titleRow}{descriptionNode}</>;

    if (layout === "horizontal") {
        return (
            <div className={classes(cl("wrapper"), cl("wrapper-horizontal"), margin && Margins[margin], className)} style={style}>
                {Icon && (
                    <span className={iconWrapperClassName}>
                        <Icon size="md" color="currentColor" />
                    </span>
                )}
                <div className={cl("content")}>{content}</div>
            </div>
        );
    }

    return (
        <div className={classes(cl("wrapper"), margin && Margins[margin], className)} style={style}>
            {content}
        </div>
    );
}
