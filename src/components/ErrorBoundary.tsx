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

import "./ErrorBoundary.css";

import { Margins } from "@components/margins";
import { LazyComponent, LazyComponentWrapper } from "@utils/lazyReact";
import { Logger } from "@utils/Logger";
import { classes } from "@utils/misc";
import type { React } from "@webpack/common";
import type { HTMLProps, PropsWithChildren } from "react";

interface Props<T = any> {
    /** Render nothing if an error occurs */
    noop?: boolean;
    /** Fallback component to render if an error occurs */
    fallback?: React.ComponentType<React.PropsWithChildren<{ error: any; message: string; stack: string; wrappedProps: T; }>>;
    /** called when an error occurs. The props property is only available if using .wrap */
    onError?(data: { error: Error, errorInfo: React.ErrorInfo, props: T; }): void;
    /** Custom error message */
    message?: string;

    /** The props passed to the wrapped component. Only used by wrap */
    wrappedProps?: T;
}

const logger = new Logger("React ErrorBoundary", "#e78284");

const NO_ERROR = {};

// We might want to import this in a place where React isn't ready yet.
// Thus, wrap in a LazyComponent
const ErrorBoundary = LazyComponent(() => {
    // This component is used in a lot of files which end up importing other Webpack commons and causing circular imports.
    // For this reason, use a non import access here.
    return class ErrorBoundary extends Velocity.Webpack.Common.React.PureComponent<React.PropsWithChildren<Props>> {
        state = {
            error: NO_ERROR as any,
            stack: "",
            message: ""
        };

        static getDerivedStateFromError(error: Error) {
            let stack = error?.stack ?? "";
            let message = error?.message || String(error);

            if (error instanceof Error && stack) {
                const eolIdx = stack.indexOf("\n");
                if (eolIdx !== -1) {
                    message = stack.slice(0, eolIdx);
                    stack = stack.slice(eolIdx + 1).replace(/https:\/\/\S+\/assets\//g, "");
                }
            }

            return { error, stack, message };
        }

        componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
            this.props.onError?.({ error, errorInfo, props: this.props.wrappedProps });
            logger.error(`${this.props.message || "A component threw an Error"}\n`, error, errorInfo.componentStack);
        }

        get isNoop() {
            if (IS_DEV) return false;
            return this.props.noop;
        }

        render() {
            if (this.state.error === NO_ERROR) return this.props.children;

            if (this.isNoop) return null;

            if (this.props.fallback)
                return (
                    <this.props.fallback
                        wrappedProps={this.props.wrappedProps}
                        {...this.state}
                    >
                        {this.props.children}
                    </this.props.fallback>
                );

            const msg = this.props.message || "An error occurred while rendering this Component. More info can be found below and in your console.";

            return (
                <ErrorCard style={{ overflow: "hidden" }}>
                    <h1>Oh no!</h1>
                    <p>{msg}</p>
                    <code>
                        {this.state.message}
                        {!!this.state.stack && (
                            <pre className={classes("vc-error-code", Margins.top8, Margins.bottom8)}>
                                {this.state.stack}
                            </pre>
                        )}
                    </code>

                    <h3>If you're on the latest version please consider reporting this in our community server.</h3>
                </ErrorCard>
            );
        }
    };
}) as
    LazyComponentWrapper<React.ComponentType<React.PropsWithChildren<Props>> & {
        wrap<T extends object = any>(Component: React.ComponentType<T>, errorBoundaryProps?: Omit<Props<T>, "wrappedProps">): React.FunctionComponent<T>;
    }>;

ErrorBoundary.wrap = (Component, errorBoundaryProps) => props => (
    <ErrorBoundary {...errorBoundaryProps} wrappedProps={props}>
        <Component {...props} />
    </ErrorBoundary>
);

export const ErrorCard = LazyComponent(() => {
    // Here again, This file is used by a lot of files, So we use a non-import access.
    const Card = Velocity.Components.Card;

    return (props: PropsWithChildren<HTMLProps<HTMLDivElement>>) => {
        return (
            <Card {...props} type={Card.Types.DANGER} outline={false} className={classes(props.className, "vc-error-card")}>
                {props.children}
            </Card>
        );
    };
});

export default ErrorBoundary;
