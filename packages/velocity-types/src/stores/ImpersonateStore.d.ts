import { FluxStore } from "..";

export namespace ImpersonateStore {
    export interface ViewingData {
        guildId: string;
        type: string;
        roles?: Record<string, any>;
        timestamp?: number;
        optInChannels?: Set<string>;
        onboardingResponses?: Set<string>;
        optInEnabled?: boolean;
        onboardingEnabled?: boolean;
        memberOptions?: {
            flags: number;
            [key: string]: any;
        };
        returnToSection?: string;
    }
}

export class ImpersonateStore extends FluxStore {
    /** Check if viewing any roles */
    hasViewingRoles(): boolean;

    /** Check if viewing roles for a guild */
    isViewingRoles(guildId: string): boolean;

    /** Get roles being viewed for a guild */
    getViewingRoles(guildId: string): Record<string, any> | undefined;

    /** Get timestamp when roles were fetched */
    getViewingRolesTimestamp(guildId: string): number | undefined;

    /** Get impersonate data for a guild */
    getData(guildId: string): ImpersonateStore.ViewingData | undefined;

    /** Check if viewing full server preview (new member) */
    isFullServerPreview(guildId: string): boolean;

    /** Check if opt-in is enabled */
    isOptInEnabled(guildId: string): boolean;

    /** Check if onboarding is enabled */
    isOnboardingEnabled(guildId: string): boolean;

    /** Get channels being viewed */
    getViewingChannels(guildId: string): Set<string> | null;

    /** Get onboarding responses */
    getOnboardingResponses(guildId: string): Set<string> | null;

    /** Get member options */
    getMemberOptions(guildId: string): { flags: number;[key: string]: any; } | null;

    /** Check if a channel is opted in */
    isChannelOptedIn(guildId: string, channelId: string): boolean;

    /** Check if viewing server shop */
    isViewingServerShop(guildId: string): boolean;

    /** Get impersonate type */
    getImpersonateType(guildId: string): string | null;

    /** Get back navigation section */
    getBackNavigationSection(guildId: string): string;
}
