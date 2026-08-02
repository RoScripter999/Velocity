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

import "./Switch.css";

import { useSettings } from "@api/Settings";
import { classNameFactory } from "@utils/css";
import { classes } from "@utils/misc";
import type { Field as FieldType } from "@velocity-types";
import { findComponentByCodeLazy } from "@webpack";
import { Field, Forms } from "@webpack/common";
import type { ComponentProps } from "react";

import { Margins } from "./margins";

const BaseSwitch = findComponentByCodeLazy("0,hasIcon:", ',layout:"horizontal",');

const switchCls = classNameFactory("vc-switch-");

const SWITCH_ON = "var(--brand-500)";
const SWITCH_OFF = "var(--primary-400)";

export interface SwitchProps extends Omit<ComponentProps<FieldType>, "children"> {
    checked: boolean;
    onChange: (checked: boolean) => void;
    hasIcon?: boolean;
    gap?: boolean;
    showBorder?: boolean;
    className?: string;
    labelledBy?: string;
}

const BuiltInSwitch = ({ className, checked, onChange, disabled, hasIcon, id, "aria-describedby": describedBy, labelledBy }: SwitchProps) => (
    <div className={className}>
        <div className={classes(switchCls("container"), "default-colors", switchCls({ checked, disabled }))}>
            <svg
                className={switchCls("slider")}
                viewBox="0 0 28 20"
                preserveAspectRatio="xMinYMid meet"
                aria-hidden="true"
                style={{
                    transform: checked ? "translateX(12px)" : "translateX(-3px)"
                }}
            >
                <rect fill="white" x="4" y="0" height="20" width="20" rx="10" />
                {hasIcon && (
                    <svg viewBox="0 0 20 20" fill="none">
                        {checked ? (
                            <>
                                <path fill={SWITCH_ON} d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z" />
                                <path fill={SWITCH_ON} d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z" />
                            </>
                        ) : (
                            <>
                                <path fill={SWITCH_OFF} d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z" />
                                <path fill={SWITCH_OFF} d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z" />
                            </>
                        )}
                    </svg>
                )}
            </svg>
            <input
                id={id}
                disabled={disabled}
                type="checkbox"
                className={switchCls("input")}
                tabIndex={0}
                checked={checked}
                onChange={e => onChange(e.currentTarget.checked)}
                aria-label="toggleSwitch"
                aria-describedby={describedBy}
                aria-labelledby={labelledBy}
            />
        </div>
    </div>
);

export function Switch({ className, checked, onChange, disabled, hasIcon, showBorder = false, gap = true, ...rest }: SwitchProps) {
    const { velocityStyles } = useSettings(["velocityStyles.switchRedesign", "velocityStyles.showRedesignedIcon"]);

    if (velocityStyles.switchRedesign === "redesigned")
        return (
            <div className={classes(className, showBorder && switchCls("border"), gap && switchCls("wrapper"))}>
                <BaseSwitch {...rest} checked={checked} onChange={onChange} disabled={disabled} hasIcon={hasIcon} />
                {showBorder && <Forms.FormDivider className={Margins.top16} />}
            </div>
        );

    return (
        <div className={classes(className, showBorder && switchCls("border"), gap && switchCls("wrapper"))}>
            <Field {...rest} layout="horizontal" interactiveLabel>
                {({ controlId, describedById, labelId }) => (
                    <BuiltInSwitch
                        id={controlId}
                        checked={checked}
                        onChange={onChange}
                        disabled={disabled}
                        hasIcon={velocityStyles.showRedesignedIcon || hasIcon}
                        aria-describedby={describedById}
                        labelledBy={labelId}
                    />
                )}
            </Field>
            {showBorder && <Forms.FormDivider className={Margins.top16} />}
        </div>
    );
}
