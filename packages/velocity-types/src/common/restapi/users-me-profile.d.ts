import { RestRequestData } from "../..";

interface ProfileEffect {
    /** @description The snowflake ID of the purchased profile effect to apply */
    id: string;
    /** @description ISO8601 timestamp when the effect expires, or null if permanent */
    expires_at: string | null;
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
    /** @description The user's bio displayed on their profile (max 190 characters) */
    bio?: string;

    /** @description The user's pronouns displayed on their profile (max 40 characters) */
    pronouns?: string;

    /**
     * @description Profile theme colors as two integers [primary, accent] encoded as hex color integers.
     * @requires Nitro. Set to null to reset to default.
     * @example [16711680, 255] = [#FF0000, #0000FF]
     */
    theme_colors?: [number, number] | null;

    /**
     * @description The user's banner, as a base64 encoded image data URI.
     * Animated GIFs require Nitro. Set to null to remove.
     * Supported formats: PNG, JPG, GIF
     * Minimum dimensions: 680x240px, max size: 10MB
     */
    banner?: string | null;

    /**
     * @description The user's accent/banner color as an integer representation of a hex color.
     * Only used when no banner image is set. @requires Nitro
     * @example 16711680 = #FF0000
     */
    accent_color?: number | null;

    /**
     * @description The type of popout animation particle effect on the profile.
     * null = none
     */
    popout_animation_particle_type?: number | null;

    /** @description A custom emoji displayed on the profile. Must be from a server the user is in */
    emoji?: ProfileEmoji | null;

    /** @description A purchased profile effect applied to the profile popout. Requires owning the effect */
    profile_effect?: ProfileEffect | null;
}

export interface UserMeProfilePayload extends RestRequestData {
    url: "/users/@me/profile";
    body: UserProfileBody;
}
