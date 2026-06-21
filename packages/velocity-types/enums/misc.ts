export const enum CloudUploadPlatform {
    REACT_NATIVE = 0,
    WEB = 1,
}

export const enum DraftType {
    ChannelMessage = 0,
    ThreadSettings = 1,
    FirstThreadMessage = 2,
    ApplicationLauncherCommand = 3,
    Poll = 4,
    SlashCommand = 5,
    ForwardContextMessage = 6,
}

export const enum GuildScheduledEventStatus {
    SCHEDULED = 1,
    ACTIVE = 2,
    COMPLETED = 3,
    CANCELED = 4,
}

export const enum GuildScheduledEventEntityType {
    STAGE_INSTANCE = 1,
    VOICE = 2,
    EXTERNAL = 3,
}

export const enum GuildScheduledEventPrivacyLevel {
    GUILD_ONLY = 2,
}

export const enum ParticipantType {
    STREAM = 0,
    HIDDEN_STREAM = 1,
    USER = 2,
    ACTIVITY = 3,
}

export const enum RTCPlatform {
    DESKTOP = 0,
    MOBILE = 1,
    XBOX = 2,
    PLAYSTATION = 3,
}

export const enum VideoSourceType {
    VIDEO = 0,
    CAMERA_PREVIEW = 1,
}

export const enum EmojiIntention {
    REACTION = 0,
    STATUS = 1,
    COMMUNITY_CONTENT = 2,
    CHAT = 3,
    GUILD_STICKER_RELATED_EMOJI = 4,
    GUILD_ROLE_BENEFIT_EMOJI = 5,
    SOUNDBOARD = 6,
    VOICE_CHANNEL_TOPIC = 7,
    GIFT = 8,
    AUTO_SUGGESTION = 9,
    POLLS = 10,
    PROFILE = 11,
    MESSAGE_CONFETTI = 12,
    GUILD_PROFILE = 13,
    CHANNEL_NAME = 14,
    DEFAULT_REACT_EMOJI = 15,
}

export const enum LoadState {
    NOT_LOADED = 0,
    LOADING = 1,
    LOADED = 2,
    ERROR = 3,
}

export const enum ConnectionStatsFlags {
    TRANSPORT = 1,
    OUTBOUND = 2,
    INBOUND = 4,
    ALL = 7,
}

export const enum SpeakingFlags {
    NONE = 0,
    VOICE = 1,
    SOUNDSHARE = 2,
    PRIORITY = 4,
    HIDDEN = 8,
}

export const enum GoLiveQualityMode {
    AUTO = 1,
    FULL = 2,
}

export const enum VoiceProcessingStateReason {
    CPU_OVERUSE = 1,
    FAILED = 2,
    VAD_CPU_OVERUSE = 3,
    INITIALIZED = 4,
}


export const enum AppealType {
    WEBFORM = 0,
    AGE_VERIFY = 1,
    IN_APP = 2,
}

export const enum AppealEligibility {
    DSA_ELIGIBLE = 1,
    IN_APP_ELIGIBLE = 2,
    AGE_VERIFY_ELIGIBLE = 3,
    AGE_VERIFY_GLOBAL_ELIGIBLE = 4,
}

export const enum AppealStatusType {
    REVIEW_PENDING = 1,
    CLASSIFICATION_UPHELD = 2,
    CLASSIFICATION_INVALIDATED = 3,
}

export const enum ClassificationRequestState {
    PENDING = 0,
    SUCCESS = 1,
    FAILED = 2,
}

export const enum GuildMemberType {
    OWNER = 1,
    MEMBER = 2,
}

export const enum FlaggedContentType {
    MESSAGE = "message",
}

export const enum LayoutType {
    /** @ignore Used by User Settings main module, Key: $ROOT */
    ROOT = 0,
    /** Used to create a new section in the {@link ROOT} */
    SECTION = 1,
    /** Used to create a new sidebar button node in the {@link SECTION} its defined in */
    SIDEBAR_ITEM = 2,
    /** Used to create a new tab/panel node. Rendered when {@link SIDEBAR_ITEM} is pressed. */
    PANEL = 3,
    /** Creates a flex that splits nodes into a horizonal flex. */
    SPLIT = 4,
    /**
     Creates an xl/normal heading in the {@link PANEL}.
     Adds a sub-button under {@link SIDEBAR_ITEM} that scrolls to the category's view when pressed (visible only in panel).
     */
    CATEGORY = 5,
    /**
     Creates a clickable button that expands or collapses nodes.
     Renders any node.
     */
    ACCORDION = 6,
    /**
     Creates a flex list with dividers after each node
     Renders any node.
    */
    LIST = 7,
    /** Creates a RELATED_SETTINGS heading with nodes rendered inside. (Mostly used with a {@link NAVIGATOR} node) */
    RELATED = 8,
    /** Creates a Card similar to the Velocity card. */
    CARD = 9,
    /** Creates a field-set similar to {@link LIST} without dividers, with a title and subtext.*/
    FIELD_SET = 10,
    /**
     Creates a tab bar item used inside a {@link PANEL}.
     When the {@link PANEL} contains multiple TAB_ITEMs, Discord renders a tab bar at the top.
     Nodes are rendered when the tab is active.
    */
    TAB_ITEM = 11,
    /** Creates a second panel in the main {@link PANEL} node and adds a breadcrumb in the title of it. */
    NESTED_PANEL_NAVIGATOR = 12,
    /* Creates a text with subtext */
    STATIC = 13,
    /* Creates a button. With a title and a subtitle */
    BUTTON = 14,
    /* Creates a toggle similar to FormSwitch */
    TOGGLE = 15,
    /** Creates a slider, similar to {@link BUTTON} layout */
    SLIDER = 16,
    /** Creates a select menu, similar to {@link BUTTON} layout */
    SELECT = 17,
    /** Creates a mana radio group with options */
    RADIO = 18,
    /** Creates a button similar to {@link ACCORDION} That switches to a different {@link PANEL} key. */
    NAVIGATOR = 19,
    /** Creates a custom node that allows any component */
    CUSTOM = 20,
}

export const enum InlineNoticeType {
    /** Renders a HelpMessage component with a button. */
    TEXT = 0,
    /** Renders any custom component. */
    STRONGLY_DISCOURAGED_CUSTOM = 1
}

export const enum NestedPanelTrailingDecorationType {
    /** Renders a Text component decoration */
    TEXT = 0,
    /** Renders a Stacked Icons component decoration */
    STACKED_ICONS = 0
}


export const enum NestedPanelLeadingDecorationType {
    /** Renders a Icon component decoration with background */
    ICON = 0,
}

export const enum HeaderDecorationType {
    /** Renders a ButtonGroup component decoration */
    BUTTON_GROUP = 0,
    /** Renders a ButtonGroup component decoration */
    STACKED_ICONS = 1
}

export const enum HeaderDecoratioButtonsButtonType {
    /** Renders a Button component */
    BUTTON = 0,
    /** Renders any component */
    STRONGLY_DISCOURAGED_CUSTOM = 1
}

export const enum BadgeType {
    NEW = 0,
    BETA = 1,
    /** @ignore Undocumented enum */
    COUNT = 2,
    /** @ignore Undocumented enum */
    WARNING = 3,
    /**
     * @ignore Undocumented enum
     * Renders any custom component.
     */
    STRONGLY_DISCOURAGED_CUSTOM = 4
}

export enum BadgeRarity {
    COMMON = 1,
    RARE = 2,
    EPIC = 3,
    LEGENDARY = 4,
    MYTHIC = 5
}
