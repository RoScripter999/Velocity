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

import "./Paginator.css";

import { classNameFactory } from "@utils/css";
import { getIntlMessage } from "@utils/discord";
import { classes } from "@utils/misc";
import { filters, findComponentByCodeLazy } from "@webpack";
import { Icons, Text, TextInput, useMemo, useState } from "@webpack/common";
import { waitForComponent } from "@webpack/common/internal";
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";

export interface PaginatorProps {
    currentPage: number;
    maxVisiblePages: number;
    pageSize: number;
    totalCount: number;

    onPageChange(page: number): void;
    className?: string;
    hideMaxPage?: boolean;
    disablePaginationGap?: boolean;
    renderPageWrapper?(page: { type: "PAGE"; key: string; targetPage: number; selected: boolean; disabled: boolean; navigateToPage(): void; }, element: ReactNode): ReactNode;
}

const cl = classNameFactory("vc-paginator-");

const Button = waitForComponent<ComponentType<any> & { Colors: any, Looks: any; Sizes: any; }>("Button", filters.componentByCode(".Type.PULSING_ELLIPSIS,", ".MEDIUM"));
const InteractiveButton = findComponentByCodeLazy<ButtonHTMLAttributes<any>>("static defaultProps=", "handleKeyPress=");

function GapButton({ pageCount, onJump, disabled }: { pageCount: number; onJump(page: number): void; disabled: boolean; }) {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState<string>("");

    const numValue = value ? parseInt(value, 10) : undefined;
    const isValid = numValue != null && numValue >= 1 && numValue <= pageCount && !isNaN(numValue);

    if (disabled) {
        return <Text aria-hidden variant="heading-sm/semibold">{"\u2026"}</Text>;
    }

    if (isOpen) {
        return (
            <div className={cl("gap-input")}>
                <TextInput
                    autoFocus={true}
                    type="number"
                    value={value}
                    onChange={newValue => {
                        const parsed = parseInt(newValue, 10);
                        if (isNaN(parsed)) {
                            setValue("");
                        } else if (parsed < 1) {
                            setValue("1");
                        } else if (parsed > pageCount) {
                            setValue(String(pageCount));
                        } else {
                            setValue(newValue);
                        }
                    }}
                    onBlur={() => {
                        setIsOpen(false);
                        setValue("");
                    }}
                    onKeyDown={e => {
                        if (e.key === "Enter" && isValid) {
                            onJump(numValue);
                            setIsOpen(false);
                            setValue("");
                        }
                        if (e.key === "e" || e.key === "-" || e.key === "+" || e.key === ".") {
                            e.preventDefault();
                        }
                    }}
                    disabled={disabled}
                />
            </div>
        );
    }

    return (
        <InteractiveButton
            onClick={() => setIsOpen(true)}
        >
            <Text aria-hidden variant="heading-sm/semibold" className={cl("round-rutton", "page-button", "gap")}>{"\u2026"}</Text>
        </InteractiveButton>
    );
}

export function Paginator({ className, currentPage, totalCount, pageSize, onPageChange, maxVisiblePages = 7, hideMaxPage = false, disablePaginationGap = false, renderPageWrapper }: PaginatorProps) {
    const max = Math.ceil(totalCount / pageSize);

    const visiblePages = useMemo(() => {
        const visible: (number | string)[] = [];

        if (max <= maxVisiblePages) {
            for (let index = 1; index <= max; index++) {
                visible.push(index);
            }
            return visible;
        }

        const half = Math.ceil(maxVisiblePages / 2);
        const quarterEnd = Math.floor(maxVisiblePages / 2);
        const [start, end] = currentPage <= half
            ? [1, maxVisiblePages]
            : currentPage > max - quarterEnd
                ? [max - maxVisiblePages + 1, max]
                : [currentPage - half + 1, currentPage + quarterEnd];

        if (start > 1) {
            visible.push(1);
            if (start > 2) visible.push("gap");
        }

        for (let i = start; i <= end; i++) {
            visible.push(i);
        }

        if (end < max) {
            if (end < max - 1) visible.push("gap");
            if (!hideMaxPage) visible.push(max);
        }

        return visible;
    }, [currentPage, max, maxVisiblePages, hideMaxPage]);

    if (max <= 1) return null;

    return (
        <div className={classes("paginator-container", className)}>
            <div className={cl("page-control-container")}>
                <nav className={cl("page-control")}>
                    <Button
                        className={cl("end-button", "page-button")}
                        innerClassName={cl("end-button-inner")}
                        look={Button.Looks.BLANK}
                        color={Button.Colors.TRANSPARENT}
                        rel="prev"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <Icons.ChevronSmallLeftIcon className={cl("icon-caret")} />
                        <span>{getIntlMessage("BACK")}</span>
                    </Button>

                    {visiblePages.map((value, key) => {
                        if (value === "gap") {
                            return (
                                <GapButton
                                    key={`gap-${key}`}
                                    pageCount={max}
                                    onJump={onPageChange}
                                    disabled={disablePaginationGap}
                                />
                            );
                        }

                        const pageButton = (
                            <InteractiveButton
                                key={`page-${value}`}
                                className={cl("round-rutton", "page-button", { selected: currentPage === value })}
                                onClick={() => onPageChange(Number(value))}
                                aria-label={`Page ${value}`}
                                aria-current={currentPage === value ? "page" : void 0}
                            >
                                <span>{value}</span>
                            </InteractiveButton>
                        );

                        if (renderPageWrapper) {
                            return renderPageWrapper({
                                type: "PAGE",
                                key: String(key),
                                targetPage: Number(value),
                                selected: currentPage === value,
                                disabled: false,
                                navigateToPage: () => onPageChange(Number(value))
                            }, pageButton);
                        }

                        return pageButton;
                    })}

                    <Button
                        className={cl("end-button", "page-button")}
                        innerClassName={cl("end-button-inner")}
                        look={Button.Looks.BLANK}
                        color={Button.Colors.TRANSPARENT}
                        rel="next"
                        disabled={currentPage === max}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        <span>{getIntlMessage("PAGINATION_NEXT")}</span>
                        <Icons.ChevronSmallRightIcon className={cl("icon-caret")} />
                    </Button>
                </nav>
            </div>
        </div>
    );
}
