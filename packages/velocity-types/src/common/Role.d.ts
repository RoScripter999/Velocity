export interface Role {
    color: number;
    colorString?: string;
    colorStrings: {
        primaryColor?: string;
        secondaryColor?: string;
        tertiaryColor?: string;
    };
    colors: {
        primary_color?: number;
        secondary_color?: number;
        tertiary_color?: number;
    };
    flags: number;
    hoist: boolean;
    icon?: string;
    id: string;
    managed: boolean;
    mentionable: boolean;
    name: string;
    originalPosition: number;
    permissions: bigint;
    position: number;
    /**
     * probably incomplete
     */
    tags: ?{
        bot_id: string;
        integration_id: string;
        premium_subscriber: unknown;
    };
    unicodeEmoji?: string;
}
