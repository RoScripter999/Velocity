import { FluxStore } from "..";

export class DeveloperOptionsStore extends FluxStore {
    get isTracingRequests(): boolean;
    get isForcedCanary(): boolean;
    get isLoggingGatewayEvents(): boolean;
    get isLoggingOverlayEvents(): boolean;
    get isLoggingAnalyticsEvents(): boolean;
    get isAxeEnabled(): boolean;
    get cssDebuggingEnabled(): boolean;
    get layoutDebuggingEnabled(): boolean;
    get sourceMapsEnabled(): boolean;
    get isAnalyticsDebuggerEnabled(): boolean;
    get isBugReporterEnabled(): boolean;
    get isIdleStatusIndicatorEnabled(): boolean;
    get onlyShowPreviewAppCollections(): boolean;
    get disableAppCollectionsCache(): boolean;
    get isStreamInfoOverlayEnabled(): boolean;
    get preventPopoutClose(): boolean;
    get logKeyboardMismatches(): boolean;
    get alertStartupMetrics(): boolean;
    get personaForceFaeFail(): boolean;
    get personaForceIdVerificationFail(): boolean;
    getDebugOptionsHeaderValue(): string;
}
