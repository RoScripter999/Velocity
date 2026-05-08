import { DiscordLocale, RestRequestData, Status, Theme } from "../..";
import { StickerAnimationSetting, StickerFormatType } from "../../../enums";

/** Interface for the Custom Status  */
interface CustomStatus {
    text?: string;
    /** Must provide a native unicode emoji. If provided a text like "skull" will fallback to null */
    emoji_name?: string;
    emoji_id?: string;
    expires_at?: string;
}

interface UserSettingsBody {
    /** @description The overall presence status of the user, synced across clients (online, idle, dnd, invisible) */
    status?: Status;

    /**
     * @description Custom status shown on the user's profile.
     * If this field is empty, Discord removes the custom status.
     */
    custom_status?: CustomStatus;

    /**
     * @description The UI color theme of the Discord client
     * @see {@link Theme}
     */
    theme?: Theme;

    /** @description The language the Discord UI is displayed in, as an ISO 639-1 region code */
    locale?: DiscordLocale;

    // Server Organization
    /** @description Guild folders shown in the sidebar. If id is null and guild_ids has one element, it represents a single guild's position rather than a folder */
    guild_folders?: Array<{
        guild_ids: string[];
        id: number | null;
        name: string | null;
        color: number | null;
    }>;

    /** @description IDs of guilds you will not receive DMs from */
    restricted_guilds?: string[];

    /** @description Whether to automatically disable DMs from members of new guilds you join */
    default_guilds_restricted?: boolean;

    // UX & Media
    /** @description Whether GIFs are automatically played when the Discord client is in focus */
    gif_auto_play?: boolean;

    /** @description Whether animated emoji play in chat */
    animate_emoji?: boolean;

    /**
     * @description Controls when stickers animate in chat
     * @see {@link StickerAnimationSetting}
     */
    animate_stickers?: StickerAnimationSetting;

    /** @description Whether to display attachments inline when they are uploaded in chat */
    inline_attachment_media?: boolean;

    /** @description Whether to display videos and images from links posted in chat */
    inline_embed_media?: boolean;

    /** @description Whether to render message embeds (link preview cards) */
    render_embeds?: boolean;

    /** @description Whether to render emoji reactions below messages */
    render_reactions?: boolean;

    /** @description Whether to use compact display mode on messages */
    message_display_compact?: boolean;

    /** @description Whether to convert emoticons like :) into emoji automatically */
    convert_emoticons?: boolean;

    // Privacy & Security
    /**
     * @description Explicit content filter applied to all direct messages
     * - 0 = Off
     * - 1 = Filter from non-friends
     * - 2 = Filter from everyone
     */
    explicit_content_filter?: number;

    /** @description Whether to show NSFW guilds on iOS (has no effect on desktop) */
    view_nsfw_guilds?: boolean;

    /** @description Whether NSFW application slash commands are shown in DMs */
    view_nsfw_commands?: boolean;

    /** @description Bitmask of friend discovery options (e.g. allow finding via phone contacts or linked accounts) */
    friend_discovery_flags?: number;

    /** @description Whether developer mode is enabled, which adds "Copy ID" to right-click context menus */
    developer_mode?: boolean;

    /** @description Controls profile visibility (undocumented enum, behavior may vary) */
    profile_visibility?: number;

    // Activity & Integration
    /** @description Whether your currently active game or app is shown in your presence status */
    show_current_game?: boolean;

    /** @description Whether Discord automatically detects accounts from services like Steam and Blizzard on client launch */
    detect_platform_accounts?: boolean;

    /** @description Duration in seconds of inactivity before the client marks you as AFK or idle */
    afk_timeout?: number;

    /** @description Your timezone offset from UTC in minutes, used for features like scheduled events */
    timezone_offset?: number;
}

export interface UserMeSettingsPayload extends RestRequestData {
    url: "/users/@me/settings";
    body: UserSettingsBody;
}
