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

import type { CSSColorToken } from "@velocity-types";
import type { Icons } from "@webpack/common";
import type { FC, ReactElement, SVGProps } from "react";

/** @ignore Please do not use this in your icons. */
export const Sizes = {
    xxs: 12,
    xs: 16,
    sm: 18,
    md: 24,
    lg: 32,
    custom: undefined!,
    refresh_sm: 20
} as const;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height" | "color"> & {
    /**
     * @default "md"
     * @remarks Values — xxs: 12, xs: 16, sm: 18, md: 24, lg: 32, refresh_sm: 20
     */
    size?: "xxs" | "xs" | "sm" | "md" | "lg" | "refresh_sm" | "custom" | typeof Sizes[keyof typeof Sizes];

    width?: number;
    height?: number;

    /** @default "interactive-icon-default" */
    color?: CSSColorToken | "currentColor" | `#${string}`;
    colorClass?: string;
};

export function createIcon(Svg: (props: IconProps) => ReactElement): FC<IconProps> {
    return props => {
        const { size = "md", width, height, color = "interactive-icon-default", colorClass = "", ...rest } = props;

        const resolvedSize =
            typeof size === "number"
                ? size
                : size === "custom"
                    ? Number(width ?? height ?? 24)
                    : Sizes[size];

        const resolvedColor =
            typeof color === "string" && color.length > 0
                ? color === "currentColor"
                    ? color
                    : /^#|rgb\(|hsl\(|rgba\(|hsla\(/.test(color)
                        ? color
                        : `var(--${color})`
                : "currentColor";


        const element = Svg({
            width: resolvedSize ?? 24,
            height: resolvedSize ?? 24,
            color: resolvedColor as any,
            ...(colorClass ? { className: colorClass } : {}),
            ...rest
        });

        const elementProps = (element as ReactElement<any>).props;

        return Icon({
            ...elementProps,
            children: elementProps.children
        });
    };
}


/**
 * @deprecated
 * This file should NOT be used unless you are creating an icon shared by **MULTIPLE** plugins
 * **AND** it does not exist in {@link Icons}.
 *
 * - Please use {@link Icons} instead.
 *
 * If {@link Icons} does not contain the icon you need, define it inside your own plugin
 * rather than adding it to this shared module.
 */
export function Icon({
    children,
    ...props
}: SVGProps<SVGSVGElement>) {
    return (
        <svg
            role={props.role ?? "img"}
            aria-hidden={props["aria-hidden"] ?? (props["aria-label"] == null)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox={props.viewBox || "0 0 24 24"}
            {...props}
        >
            {children}
        </svg>
    );
}

export const VelocityIcon = createIcon((props: IconProps) => (
    <Icon {...props}>
        <path
            className={props.colorClass ?? ""}
            fill={props.color}
            transform="scale(1.25) translate(-2 -2)"
            d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"
        />
    </Icon>
));

export const PluginsIcon = createIcon((props: IconProps) => (
    <Icon {...props}>
        <g transform="translate(1 0)">
            <path
                fill={props.color}
                d="M16.059 10.8227C15.2884 11.4957 14.1663 11.3616 13.4404 10.641C12.2975 9.50625 8.99308 6.21104 8.99308 6.21104C8.39701 5.63087 8.39701 4.44662 8.99308 3.85464C9.81903 3.03435 11.1053 1.75146 11.1053 1.75146C11.4641 1.39195 11.956 1.18972 12.4653 1.18886L15.8363 1.18425L17.0255 0L20 2.96048L18.8108 4.14473L18.8021 7.50878C18.7992 8.01636 18.5967 8.50262 18.235 8.86127C18.235 8.86127 17.0718 9.93835 16.059 10.8227ZM12.7315 11.9548L10.9954 13.8273C11.5972 14.4265 11.5972 14.9113 11.14 15.6997L8.89757 18.2485C8.53588 18.6081 8.04689 18.8103 7.53473 18.8111L4.16378 18.8158L2.97455 20L0 17.0395L1.18927 15.8553L1.20082 12.4912C1.20082 11.9836 1.40338 11.4974 1.76507 11.1387L3.87153 9.04044C4.46759 8.44846 5.65685 8.44846 6.23844 9.04044L6.24424 9.0465L8.02951 7.26998L9.21878 8.45423L7.43347 10.2305L9.81193 12.599L11.5972 10.8227L12.7315 11.9548Z"
            />
        </g>
    </Icon>
));

export const ImageIcon = createIcon((props: IconProps) => (
    <Icon {...props} >
        <path
            fill={props.color}
            d="M21,19V5c0,-1.1 -0.9,-2 -2,-2H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2zM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5,-4.5z"
        />
    </Icon>
));

export const ImageVisible = createIcon((props: IconProps) => (
    <Icon {...props}>
        <path
            fill={props.color}
            d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm1-2h12l-3.75-5-3 4L9 13Zm-1 2V5v14Z"
        />
    </Icon>
));

export const ImageInvisible = createIcon((props: IconProps) => (
    <Icon {...props}>
        <path
            fill={props.color}
            d="m21 18.15-2-2V5H7.85l-2-2H19q.825 0 1.413.587Q21 4.175 21 5Zm-1.2 4.45L18.2 21H5q-.825 0-1.413-.587Q3 19.825 3 19V5.8L1.4 4.2l1.4-1.4 18.4 18.4ZM6 17l3-4 2.25 3 .825-1.1L5 7.825V19h11.175l-2-2Zm7.425-6.425ZM10.6 13.4Z"
        />
    </Icon>
));

export const GithubIcon = createIcon((props: IconProps) => (
    <Icon {...props}>
        <path
            fill={props.color}
            d="M12 1.5C6.04 1.5 1.5 6.04 1.5 12c0 4.84 3.12 8.96 7.44 10.41.55.1.76-.24.76-.53v-2.02c-3.03.66-3.68-1.46-3.68-1.46-.5-1.26-1.2-1.6-1.2-1.6-.98-.68.08-.66.08-.66 1.09.08 1.66 1.12 1.66 1.12.97 1.67 2.55 1.19 3.18.91.1-.71.38-1.19.69-1.47-2.43-.27-4.98-1.22-4.98-5.44 0-1.2.43-2.18 1.12-2.95-.11-.28-.49-1.4.1-2.92 0 0 .92-.3 3.02 1.13.88-.25 1.82-.36 2.76-.36.94 0 1.88.11 2.76.36 2.1-1.43 3.02-1.13 3.02-1.13.59 1.52.21 2.64.1 2.92.69.77 1.12 1.75 1.12 2.95 0 4.23-2.56 5.17-5.01 5.43.39.33.75.99.75 2v2.97c0 .29.2.63.76.53C19.38 20.96 22.5 16.84 22.5 12c0-5.96-4.54-10.5-10.5-10.5Z"
        />
    </Icon>
));

export const CloudUploadIcon = createIcon((props: IconProps) => (
    <Icon {...props}>
        <path
            fill={props.color}
            d="M11 20H6.5Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20H13V12.85L14.6 14.4L16 13L12 9L8 13L9.4 14.4L11 12.85Z"
        />
    </Icon>
));

export const BrokenHeart = createIcon((props: IconProps) => (
    <Icon viewBox="0 0 36 36" {...props}>
        <g fill={props.color}>
            <path
                d="M13.589 26.521c-.297-.495-.284-1.117.035-1.599l4.395-6.646-5.995-5.139c-.556-.476-.686-1.283-.31-1.911l4.304-7.172c-1.669-1.301-3.755-2.09-6.035-2.09-5.45 0-9.868 4.417-9.868 9.868 0 .772.098 1.52.266 2.241C1.751 22.587 11.216 31.568 18 34.034c.025-.009.052-.022.077-.032l-4.488-7.481z"
            />
            <path
                d="M26.018 1.966c-2.765 0-5.248 1.151-7.037 2.983l-4.042 6.737 6.039 5.176c.574.492.691 1.335.274 1.966l-4.604 6.962 4.161 6.935c6.338-3.529 13.621-11.263 14.809-18.649.17-.721.268-1.469.268-2.241-.001-5.452-4.419-9.869-9.868-9.869z"
            />
        </g>
    </Icon>
));
