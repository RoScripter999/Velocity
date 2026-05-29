// TODO: a lot of optional params can also be null, not just undef

import { DiscordRecord } from "./Record";
import { AvatarDecorationData, ClanData, Collectibles, DisplayNameStyles } from "./Channel";
import { PremiumType, UserFlags } from "../../enums";

export class User extends DiscordRecord {
    constructor(user: object);
    ageVerificationStatus: number;
    avatar: string;
    avatarDecorationData: ?AvatarDecorationData;
    banner?: ?string;
    bot: boolean;
    collectibles: ?Collectibles;
    desktop: boolean;
    discriminator: string;
    displayNameStyles: ?DisplayNameStyles;
    email?: string;
    flags: UserFlags;
    globalName?: string;
    guildMemberAvatars: Record<string, string>;
    hasBouncedEmail: boolean;
    id: string;
    mfaEnabled: boolean;
    mobile: boolean;
    nsfwAllowed?: boolean;
    personalConnectionId: ?string;
    phone?: string;
    premiumState: ?{ subscriptionId: string; };
    premiumType?: PremiumType;
    premiumUsageFlags: number;
    primaryGuild: ?ClanData;
    publicFlags: UserFlags;
    purchasedFlags: number;
    system: boolean;
    username: string;
    verified: boolean;

    get avatarDecoration(): ?AvatarDecorationData;
    get createdAt(): Date;
    get isProvisional(): boolean;
    get nameplate(): ?{ asset: string; skuId: string; };
    get premiumGroupRole(): ?{ id: string; name: string; color: number; };
    get tag(): string;

    addGuildAvatarHash(guildId: string, avatarHash: string): this;
    getAvatarSource(guildId: string): { uri: string; };
    getAvatarURL(guildId?: string | null, size?: number, canAnimate?: boolean, format?: string): string;
    hadPremiumSubscription(): boolean;
    hasAvatarForGuild(guildId: string): boolean;
    hasFlag(flag: UserFlags): boolean;
    hasFreePremium(): boolean;
    hasHadPremium(): boolean;
    hasHadSKU(sku: string): boolean;
    hasPremiumUsageFlag(flag: number): boolean;
    hasPurchasedFlag(flag: number): boolean;
    hasUniqueUsername(): boolean;
    hasUrgentMessages(): boolean;
    hasVerifiedEmailOrPhone(): boolean;
    isClaimed(): boolean;
    isFractionalPremiumWithNoSubscription(): boolean;
    isLocalBot(): boolean;
    isNonUserBot(): boolean;
    isPhoneVerified(): boolean;
    isPremiumGroupMember(): boolean;
    isPremiumGroupPrimary(): boolean;
    isPremiumWithFractionalPremiumOnly(): boolean;
    isPremiumWithPremiumGroup(): boolean;
    isSystemUser(): boolean;
    isVerifiedBot(): boolean;
    removeGuildAvatarHash(guildId: string): this;
    toJS(): object;
    toString(): string;
    update(props: Partial<User>): this;
}

export interface UserJSON {
    avatar: string;
    avatarDecoration: ?AvatarDecorationData;
    discriminator: string;
    id: string;
    publicFlags: UserFlags;
    username: string;
    globalName?: string;
}

export interface ProfileEffect {
    skuId: string;
    title?: string;
    description?: string;
    accessibilityLabel?: string;
    reducedMotionSrc?: string;
    thumbnailPreviewSrc?: string;
    effects?: any[];
    animationType?: number;
    staticFrameSrc?: string;
    type?: number;
}

export interface Nameplate {
    skuId: string;
    asset: string;
    label?: string;
    palette?: string;
    type?: number;
}

export interface ProfilePreset {
    name: string;
    timestamp: number;
    avatarDataUrl?: ?string;
    bannerDataUrl?: ?string;
    bio?: ?string;
    accentColor?: ?number;
    themeColors?: ?number[];
    globalName?: ?string;
    pronouns?: ?string;
    avatarDecoration?: ?{
        asset: string;
        skuId: string;
    };
    profileEffect?: ?ProfileEffect;
    nameplate?: ?Nameplate;
    primaryGuildId?: ?string;
    customStatus?: ?CustomStatus;
    displayNameStyles?: ?DisplayNameStyles;
}

export interface CustomStatus {
    text?: string;
    emojiId?: string;
    emojiName?: string;
    expiresAtMs?: string;
}
