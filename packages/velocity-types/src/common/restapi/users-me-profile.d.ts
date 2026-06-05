import { PremiumType, UserFlags } from "@velocity-types/enums";
import { AvatarDecorationData, ConnectedAccount, DisplayNameStyles, RestRequestData, ToApi } from "../..";

type BadgeIDs = "premium" | "premium_tenure_1_month_v2" | "premium_tenure_3_month_v2" | "premium_tenure_6_month_v2" | "premium_tenure_12_month_v2" | "premium_tenure_24_month_v2" | "premium_tenure_36_month_v2" | "premium_tenure_60_month_v2" | "premium_tenure_72_month_v2" | "partner" | "certified_moderator" | "hypesquad" | "hypesquad_house_1" | "hypesquad_house_2" | "hypesquad_house_3" | "bug_hunter_level_1" | "bug_hunter_level_2" | "verified_developer" | "early_supporter" | "guild_booster_lvl1" | "guild_booster_lvl2" | "guild_booster_lvl3" | "guild_booster_lvl4" | "guild_booster_lvl5" | "guild_booster_lvl6" | "guild_booster_lvl7" | "guild_booster_lvl8" | "guild_booster_lvl9" | "legacy_username" | "quest_completed" | "april_fools_2026" | "orb_profile_badge" | "staff";

interface ProfileEffect {
    /** @description The snowflake ID of the purchased profile effect to apply */
    id: string;
    /** @description ISO8601 timestamp when the effect expires, or null if permanent */
    expires_at: ?string;
}

interface ProfileEmoji {
    /** @description The snowflake ID of the custom guild emoji */
    id: string;
    /** @description The name of the emoji */
    name: string;
    /** @description Whether the emoji is animated */
    animated: boolean;
}

interface UserProfileBody {
    /**
     * @description The user's bio displayed on their profile.
     * will only accept 190 characters at max.
     */
    bio?: string;

    /** @description The user's pronouns displayed on their profile (max 40 characters) */
    pronouns?: string;

    /**
     * @description Profile theme colors as two integers [primary, accent] encoded as hex color integers.
     * @requires Nitro.
     */
    theme_colors?: ?[number, number];

    /**
     * @description The user's banner, as a base64 encoded image data URI.
     * @requires Nitro
     *
     * Base64 encoded image, with the minimum dimensions of 680x240px, and max size 10MB
     */
    banner?: ?string;

    /**
     * @description The user's accent/banner color as an integer representation of a hex color.
     * Only works when user does not have Nitro. @see {@link theme_colors}
     */
    accent_color?: ?number;

    /**
     * @description The type of popout animation particle effect on the profile.
     */
    popout_animation_particle_type?: ?number;

    /** @description A custom emoji displayed on the profile. Must be from a server the user is in */
    emoji?: ?ProfileEmoji;

    /** @description A purchased profile effect applied to the profile popout. requires owning the effect in the account */
    profile_effect?: ?ProfileEffect;
}

interface ProfileResponseUser {
    id: string;
    username: string;
    global_name: ?string;
    avatar: ?string;
    avatar_decoration_data: ?ToApi<AvatarDecorationData>;
    collectibles: ?{
        nameplate?: ?{
            asset: string;
            palette: string;
            label: string;
            sku_id: string;
            expires_at: ?string;
        };
    };
    discriminator: string;
    display_name_styles: ?DisplayNameStyles;
    public_flags: number;
    flags: UserFlags;
    primary_guild: ?string;
    clan: ?{
        badge: string;
        identity_enabled: boolean;
        identity_guild_id: string;
        tag: string;
    };
    banner: ?string;
    banner_color: ?string;
    accent_color: ?number;
    bio: string;
}

interface ProfileResponseUserProfile {
    bio: ?string;
    accent_color: ?number;
    pronouns: string;
    profile_effect: ?{
        sku_id: string;
        expires_at: ?string;
    };
    collectibles: Array<{
        sku_id: string;
        type: number;
        expires_at: ?string;
    }>;
    banner: ?string;
    theme_colors: ?[number, number];
    popout_animation_particle_type: ?number;
    emoji: ?ProfileEmoji;
}

interface ProfileBadge {
    id: BadgeIDs;
    description: string;
    icon: string;
    link?: string;
}

interface ProfileWidget {
    id: string;
    updated_at: ?string;
    data: {
        type: Widget;
        games: Array<{
            game_id: string;
            comment: ?string;
            tags: string[];
        }>;
    };
}

export interface UserMeProfileGetResponse {
    user: ProfileResponseUser;
    user_profile: ProfileResponseUserProfile;
    connected_accounts: ConnectedAccount[];
    premium_type: ?PremiumType;
    premium_since: ?string;
    premium_guild_since: ?string;
    profile_themes_experiment_bucket: number;
    badges: ProfileBadge[];
    guild_badges: any[];
    widgets: ProfileWidget[];
    mutual_guilds: Array<{
        id: string;
        nick: ?string;
    }>;
}

/**
 * Allowed methods: `patch`, `get`
 */
export interface UserMeProfilePayload extends RestRequestData<`/users/${string}/profile`> {
    body?: UserProfileBody;
}
