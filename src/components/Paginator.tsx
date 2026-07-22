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
import { Icons, Text, useMemo } from "@webpack/common";
import type { ReactNode } from "react";

export interface PaginatorProps {
    currentPage: number;
    maxVisiblePages: number;
    pageSize: number;
    totalCount: number;

    onPageChange(page: number): void;
    className?: string;
    renderPageWrapper?(page: { type: "PAGE"; key: string; targetPage: number; selected: boolean; disabled: boolean; navigateToPage(): void; }, element: ReactNode): ReactNode;
}

export function Paginator({ className, currentPage, totalCount, pageSize, onPageChange, maxVisiblePages = 7, renderPageWrapper }: PaginatorProps) {
    const max = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

    const visiblePages = useMemo(() => {
        const visible: (number | string)[] = [];

        if (max <= maxVisiblePages) {
            for (let index = 1; index <= max; index++) {
                visible.push(index);
            }
        }
        else {
            const half = Math.trunc(maxVisiblePages / 2);

            const m2 = maxVisiblePages - 2;

            if (currentPage <= half) {
                for (let index = 1; index <= m2; index++) {
                    visible.push(index);
                }

                visible.push("...", max);
            }
            else if (currentPage >= max - half) {
                visible.push(1, "...");

                for (let index = max - m2 + 1; index <= max; index++) {
                    visible.push(index);
                }
            }
            else {
                const diff = Math.floor((maxVisiblePages - 4) / 2);

                visible.push(1, "...");

                for (let index = currentPage - diff; index <= (currentPage + diff); index++) {
                    visible.push(index);
                }

                visible.push("...", max);
            }
        }

        return visible;
    }, [currentPage, max, maxVisiblePages]);

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
                    const ellipsis = value === "...";

                    const bubble = (
                        <div
                            key={key}
                            className="vc-paginator-bubble"
                            onClick={ellipsis ? () => { } : () => onPageChange(value as number)}
                            data-selected={currentPage === value}
                            data-ellipsis={ellipsis}
                        >{value}</div>
                    );

                    if (!ellipsis && renderPageWrapper) {
                        return renderPageWrapper({
                            type: "PAGE",
                            key: String(key),
                            targetPage: value as number,
                            selected: currentPage === value,
                            disabled: false,
                            navigateToPage: () => onPageChange(value as number)
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
