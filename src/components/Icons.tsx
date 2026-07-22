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
            d="M2 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5Zm13.35 8.13 3.5 4.67c.37.5.02 1.2-.6 1.2H5.81a.75.75 0 0 1-.59-1.22l1.86-2.32a1.5 1.5 0 0 1 2.34 0l.5.64 2.23-2.97a2 2 0 0 1 3.2 0ZM10.2 5.98c.23-.91-.88-1.55-1.55-.9a.93.93 0 0 1-1.3 0c-.67-.65-1.78-.01-1.55.9a.93.93 0 0 1-.65 1.12c-.9.26-.9 1.54 0 1.8.48.14.77.63.65 1.12-.23.91.88 1.55 1.55.9a.93.93 0 0 1 1.3 0c.67.65 1.78.01 1.55-.9a.93.93 0 0 1 .65-1.12c.9-.26.9-1.54 0-1.8a.93.93 0 0 1-.65-1.12Z"
            fillRule="evenodd"
        />
    </Icon>
));

export const ImageInvisible = createIcon((props: IconProps) => (
    <Icon {...props}>
        <path
            fill={props.color}
            d="M1.4 21.2C1.28538 21.2859 1.19058 21.3955 1.122 21.5213C1.05342 21.6471 1.01267 21.7862 1.00252 21.9291C0.992359 22.072 1.01303 22.2154 1.06313 22.3497C1.11323 22.4839 1.19159 22.6058 1.29289 22.7071C1.3942 22.8084 1.5161 22.8867 1.65033 22.9368C1.78455 22.9869 1.92798 23.0076 2.07089 22.9975C2.2138 22.9873 2.35286 22.9466 2.47866 22.878C2.60445 22.8094 2.71404 22.7146 2.8 22.6L22.8 2.6C22.9444 2.40743 23.0145 2.16923 22.9975 1.92912C22.9804 1.68901 22.8773 1.46311 22.7071 1.2929C22.5369 1.12269 22.311 1.01959 22.0709 1.00252C21.8308 0.985456 21.5926 1.05558 21.4 1.20001L1.4 21.2ZM22.0996 18.8999C22.0996 19.6955 21.7833 20.4584 21.2207 21.021C20.6581 21.5836 19.8953 21.8999 19.0996 21.8999H6.11621L9.11621 18.8999H18.3496C18.9696 18.8999 19.3192 18.1997 18.9492 17.6997L15.4492 13.0298C15.3831 12.9417 15.3076 12.8622 15.2285 12.7866L22.0996 5.9165V18.8999ZM10.2725 9.70947C10.2699 9.54192 10.312 9.37522 10.3975 9.22802C10.5187 9.01911 10.7168 8.86596 10.9492 8.80029C11.8492 8.54029 11.8492 7.25951 10.9492 6.99951C10.7168 6.93383 10.5187 6.78068 10.3975 6.57177C10.2762 6.36282 10.2415 6.1148 10.2998 5.88037C10.5298 4.97044 9.42001 4.33024 8.75 4.97998C8.57624 5.14978 8.34255 5.24463 8.09961 5.24463C7.85666 5.24463 7.62297 5.14978 7.44922 4.97998C6.7792 4.33024 5.66943 4.97044 5.89941 5.88037C5.95773 6.1148 5.92302 6.36282 5.80176 6.57177C5.6805 6.78068 5.48244 6.93383 5.25 6.99951C4.35 7.25951 4.35 8.54029 5.25 8.80029C5.72959 8.94043 6.01912 9.42972 5.89941 9.91943C5.66943 10.8294 6.7792 11.4696 7.44922 10.8198C7.62297 10.65 7.85666 10.5552 8.09961 10.5552C8.34255 10.5552 8.57624 10.65 8.75 10.8198C8.82575 10.8933 8.90776 10.9488 8.99218 10.9907L2.09961 17.8833V4.8999C2.09961 4.10425 2.41591 3.34142 2.97851 2.77881C3.54112 2.2162 4.30396 1.8999 5.09961 1.8999H18.083L10.2725 9.70947Z"
            fillRule="evenodd"
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
