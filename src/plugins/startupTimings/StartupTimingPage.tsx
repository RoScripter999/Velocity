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

import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Grid } from "@components/Grid";
import { Margins } from "@components/margins";
import { SettingsTab } from "@components/settings";
import { Span } from "@components/Span";
import { findByPropsLazy } from "@webpack";
import { Forms, Text } from "@webpack/common";

interface AppStartPerformance {
    prefix: string;
    logs: Log[];
    logGroups: LogGroup[];
    endTime_: number;
    isTracing_: boolean;
}

interface LogGroup {
    index: number;
    timestamp: number;
    logs: Log[];
    nativeLogs: any[];
    serverTrace: string;
}

interface Log {
    emoji: string;
    prefix: string;
    log: string;
    timestamp?: number;
    delta?: number;
}

const AppStartPerformance = findByPropsLazy("markWithDelta", "markAndLog", "markAt") as AppStartPerformance;

interface TimerItemProps extends Log {
    instance: {
        sinceStart: number;
        sinceLast: number;
    };
}

function TimerItem({ emoji, prefix, log, delta, instance }: TimerItemProps) {
    return (
        <>
            <Span>{instance.sinceStart.toFixed(3)}s</Span>
            <Span>{instance.sinceLast.toFixed(3)}s</Span>
            <Span>{delta?.toFixed(0) ?? ""}</Span>
            <Span><pre>{emoji} {prefix ?? " "}{log}</pre></Span>
        </>
    );
}

interface TimingSectionProps {
    title: string;
    logs: Log[];
    traceEnd?: number;
}

function TimingSection({ title, logs, traceEnd }: TimingSectionProps) {
    const startTime = logs.find(l => l.timestamp)?.timestamp ?? 0;

    let lastTimestamp = startTime;
    const timings = logs.map(log => {
        // Get last log entry with valid timestamp
        const timestamp = log.timestamp ?? lastTimestamp;

        const sinceStart = (timestamp - startTime) / 1000;
        const sinceLast = (timestamp - lastTimestamp) / 1000;

        lastTimestamp = timestamp;

        return { sinceStart, sinceLast };
    });

    return (
        <SettingsTab>
            <code>
                {traceEnd && (
                    <Text variant="heading-md/extrabold">Trace ended at: {(new Date(traceEnd)).toTimeString()}</Text>
                )}
                <Grid columns={3} gap="2px 10px" style={{ gridTemplateColumns: "repeat(3, auto) 1fr", userSelect: "text" }}>
                    <Span>Start</Span>
                    <Span>Interval</Span>
                    <Span>Delta</Span>
                    <Span>Event</Span>
                    {AppStartPerformance.logs.map((log, i) => (
                        <TimerItem key={i} {...log} instance={timings[i]} />
                    ))}
                </Grid>
            </code>
        </SettingsTab>
    );
}

interface ServerTraceProps {
    trace: string;
}

function ServerTrace({ trace }: ServerTraceProps) {
    const lines = trace.split("\n");

    return (
        <Forms.FormSection tag="h3" title="Server Trace">
            <code>
                <Flex flexDirection="column" gap={5} style={{ userSelect: "text" }}>
                    {lines.map((line, idx) => (
                        <Span key={idx}>{line}</Span>
                    ))}
                </Flex>
            </code>
        </Forms.FormSection>
    );
}

function StartupTimingPage() {
    const serverTrace = AppStartPerformance.logGroups.find(g => g.serverTrace)?.serverTrace;

    return (
        <>
            <TimingSection
                title="Startup Timings"
                logs={AppStartPerformance.logs}
                traceEnd={AppStartPerformance.endTime_}
            />
            <Forms.FormDivider className={Margins.top8} />
            {serverTrace && <ServerTrace trace={serverTrace} />}
        </>
    );
}

export default ErrorBoundary.wrap(StartupTimingPage);
