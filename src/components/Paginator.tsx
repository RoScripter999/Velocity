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

import { getIntlMessage } from "@utils/discord";
import { classes } from "@utils/misc";
import { Icons, Text, TextInput, useMemo, useState } from "@webpack/common";
import type { ReactNode } from "react";

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
            <div className="vc-paginator-gap-input">
                <TextInput
                    inputRef={element => {
                        if (element) {
                            element.focus();
                        }
                    }}
                    type="number"
                    value={value}
                    onChange={setValue}
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
                    }}
                    disabled={disabled}
                    placeholder={`1-${pageCount}`}
                    maxLength={String(pageCount).length}
                    minLength={1}
                />
            </div>
        );
    }

    return (
        <button
            className="vc-paginator-gap"
            onClick={() => setIsOpen(true)}
        >
            <Text aria-hidden variant="heading-sm/semibold">{"\u2026"}</Text>
        </button>
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

        console.error("visiblePages:", visible);
        return visible;
    }, [currentPage, max, maxVisiblePages, hideMaxPage]);

    if (max <= 1) return null;

    return (
        <div className={classes("vc-paginator", className)}>
            <button
                className="vc-paginator-button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <Icons.ChevronSmallLeftIcon size="sm" />
                <Text lineClamp={1} variant="text-md/semibold" color={currentPage === 1 ? "text-muted" : "text-default"}>{getIntlMessage("BACK")}</Text>
            </button>
            <div className="vc-paginator-bubbles">
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

                    const bubble = (
                        <div
                            key={`page-${value}`}
                            className="vc-paginator-bubble"
                            onClick={() => onPageChange(Number(value))}
                            data-selected={currentPage === value}
                        >{value}</div>
                    );

                    if (renderPageWrapper) {
                        return renderPageWrapper({
                            type: "PAGE",
                            key: String(key),
                            targetPage: Number(value),
                            selected: currentPage === value,
                            disabled: false,
                            navigateToPage: () => onPageChange(Number(value))
                        }, bubble);
                    }

                    return bubble;
                })}
            </div>
            <button
                className="vc-paginator-button"
                disabled={currentPage === max}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <Text lineClamp={1} variant="text-md/semibold" color={currentPage === max ? "text-muted" : "text-default"}>{getIntlMessage("PAGINATION_NEXT")}</Text>
                <Icons.ChevronSmallRightIcon size="sm" />
            </button>
        </div>
    );
}
