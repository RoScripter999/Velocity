export enum RelationshipType {
    /**
     * No relationship exists
     */
    NONE = 0,
    /**
     * The user is a friend
     */
    FRIEND = 1,
    /**
     * The user is blocked
     */
    BLOCKED = 2,
    /**
     * The user has sent a friend request to the current user
     */
    INCOMING_REQUEST = 3,
    /**
     * The current user has sent a friend request to the user
     */
    OUTGOING_REQUEST = 4,
    /**
     * The user is an affinity of the current user
     */
    IMPLICIT = 5,
    /**
     * The user is a friend suggestion for the current user
     */
    SUGGESTION = 6,

}

export const enum PremiumType {
    NONE = 0,
    TIER_1 = 1,
    TIER_2 = 2,
    TIER_0 = 3,
}

export const enum StandingState {
    ALL_GOOD = 100,
    LIMITED = 200,
    VERY_LIMITED = 300,
    AT_RISK = 400,
    SUSPENDED = 500,
}

export enum GiftIntentType {
    FRIEND_ANNIVERSARY = 0
}

export const enum ReadStateType {
    CHANNEL = 0,
    GUILD_EVENT = 1,
    NOTIFICATION_CENTER = 2,
    GUILD_HOME = 3,
    GUILD_ONBOARDING_QUESTION = 4,
    MESSAGE_REQUESTS = 5,
}

export enum UserFlags {
    /**
     * Discord Employee
     */
    Staff = 1 << 0,
    /**
     * Partnered Server Owner
     */
    Partner = 1 << 1,
    /**
     * HypeSquad Events Member
     */
    Hypesquad = 1 << 2,
    /**
     * Bug Hunter Level 1
     */
    BugHunterLevel1 = 1 << 3,
    /**
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    MFASMS = 1 << 4,
    /**
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    PremiumPromoDismissed = 1 << 5,
    /**
     * House Bravery Member
     */
    HypeSquadOnlineHouse1 = 1 << 6,
    /**
     * House Brilliance Member
     */
    HypeSquadOnlineHouse2 = 1 << 7,
    /**
     * House Balance Member
     */
    HypeSquadOnlineHouse3 = 1 << 8,
    /**
     * Early Nitro Supporter
     */
    PremiumEarlySupporter = 1 << 9,
    /**
     * User is a {@link https://discord.com/developers/docs/topics/teams | team}
     */
    TeamPseudoUser = 1 << 10,
    /**
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    HasUnreadUrgentMessages = 1 << 13,
    /**
     * Bug Hunter Level 2
     */
    BugHunterLevel2 = 1 << 14,
    /**
     * Verified Bot
     */
    VerifiedBot = 1 << 16,
    /**
     * Early Verified Bot Developer
     */
    VerifiedDeveloper = 1 << 17,
    /**
     * Moderator Programs Alumni
     */
    CertifiedModerator = 1 << 18,
    /**
     * Bot uses only {@link https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction | HTTP interactions} and is shown in the online member list
     */
    BotHTTPInteractions = 1 << 19,
    /**
     * User has been identified as spammer
     *
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    Spammer = 1 << 20,
    /**
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    DisablePremium = 1 << 21,
    /**
     * User is an {@link https://support-dev.discord.com/hc/articles/10113997751447 | Active Developer}
     */
    ActiveDeveloper = 1 << 22,
    /**
     * User's account has been {@link https://support.discord.com/hc/articles/6461420677527 | quarantined} based on recent activity
     *
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     * @privateRemarks
     *
     * This value would be `1 << 44`, but bit shifting above `1 << 30` requires bigints
     */
    Quarantined = 17_592_186_044_416,
    /**
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     * @privateRemarks
     *
     * This value would be `1 << 50`, but bit shifting above `1 << 30` requires bigints
     */
    Collaborator = 1_125_899_906_842_624,
    /**
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     * @privateRemarks
     *
     * This value would be `1 << 51`, but bit shifting above `1 << 30` requires bigints
     */
    RestrictedCollaborator = 2_251_799_813_685_248,
}

export enum TokenStatus {
    INVALID = 0,
    VALIDATING = 1,
    VALID = 2
}
