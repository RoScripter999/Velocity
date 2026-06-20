import { BadgeRarity } from "../../enums";

export interface BadgeTierRequirement {
    threshold: number;
    unit: "months" | "years";
}

export interface BadgeTier {
    key: string;
    name?: string;
    owned: boolean;
    simple_icon_url: ?string;
    complex_icon_static_url: ?string;
    complex_icon_animated_url: ?string;
    rarity?: ?BadgeRarity;
    requirements: BadgeTierRequirement[];
}

export interface DiscordBadge {
    badge_id: string;
    name: string;
    description: string;
    simple_icon_url?: ?string;
    complex_icon_static_url?: ?string;
    complex_icon_animated_url?: ?string;
    owned: boolean;
    is_earnable: boolean;
    tiers?: BadgeTier[];
    current_tier?: ?string;
    next_tier?: ?string;
    rarity?: BadgeRarity;
    obtained_at?: string;
    tier_obtained_at?: Record<string, string>;
}
