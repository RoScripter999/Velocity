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
import { type MarginDirection, Margins, type MarginSize } from "@components/margins";
import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import type { TextProps } from "@velocity-types";
import { RichTooltip, Text, Tooltip } from "@webpack/common";
import type { ComponentPropsWithoutRef, ComponentType, HTMLAttributes, JSX, ReactNode } from "react";

const cl = classNameFactory("vc-settings-section-header-");

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title: ReactNode;
    description?: ReactNode;
    /**
     * Icon that appears between the text on the left side,
     * If {@link layout} set to `horizontal`, Icon will appear in-between text and description
     */
    icon?: ComponentType<any>;

    /**
     * Tooltip text appears when hovering on {@link title}
     */
    tooltip?: string | ComponentPropsWithoutRef<typeof RichTooltip>;
    /** Element type of the {@link title} */
    tag?: Extract<keyof JSX.IntrinsicElements, string>;
    /**
     * Layout of the field
     *
     * @default vertical
     */
    layout?: "vertical" | "horizontal";
    gap?: {
        [key in MarginDirection]?: MarginSize
    };
    iconWrapperClassName?: string;
    titleVariant?: TextProps["variant"];
    titleColor?: TextProps["color"];
    /** @default text-sm/normal */
    descriptionVariant?: TextProps["variant"];
    /** @default text-muted */
    descriptionColor?: TextProps["color"];
}

export function SectionHeader({
    title,
    description,
    icon: Icon,
    tooltip,
    tag,
    layout = "vertical",
    gap,
    iconWrapperClassName,
    titleVariant,
    titleColor,
    descriptionVariant = "text-sm/normal",
    descriptionColor = "text-muted",
    className,
    ...rest
}: SectionHeaderProps) {
    const tooltipText = typeof tooltip === "string" ? tooltip : undefined;
    const richTooltipProps = typeof tooltip === "object" ? tooltip : undefined;

    const gapClasses = gap ? Object.entries(gap).map(([direction, size]) => Margins[`${direction}${size}`]) : [];

    const titleNode = titleVariant
        ? <Text variant={titleVariant} color={titleColor}>{title}</Text>
        : titleColor
            ? <Text tag={tag} color={titleColor}>{title}</Text>
            : <Heading tag={tag as any} className={cl("title")}>{title}</Heading>;


    const titleWithTooltip = tooltipText
        ? (
            <Tooltip text={tooltipText}>
                {({ onMouseEnter, onMouseLeave }) => (
                    <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                        {titleNode}
                    </span>
                )}
            </Tooltip>
        )
        : richTooltipProps
            ? <RichTooltip {...richTooltipProps} asContainer>{titleNode}</RichTooltip>
            : titleNode;

    const iconNode = Icon && (
        layout === "horizontal"
            ? <span className={iconWrapperClassName}><Icon size="md" color="currentColor" /></span>
            : <Icon size="sm" color="currentColor" />
    );

    const descriptionNode = typeof description === "string" ? <Text variant={descriptionVariant} color={descriptionColor}>{description}</Text> : description;

    return (
        <div
            className={classes(cl("container"), ...gapClasses, className)}
            data-layout={layout}
            {...rest}
        >
            {layout === "horizontal" && iconNode}
            <div className={cl("content")}>
                <div className={cl("title-container")}>
                    {layout === "vertical" && iconNode}
                    {titleWithTooltip}
                </div>
                {descriptionNode}
            </div>
        </div>
    );
}
