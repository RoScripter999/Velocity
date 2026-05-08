export const enum ButtonStyle {
    /**
     * The most important or recommended action in a group of options
    */
    PRIMARY = 1,
    /**
     * Alternative or supporting actions
    */
    SECONDARY = 2,
    /**
     * Positive confirmation or completion actions
    */
    SUCCESS = 3,
    /**
     * An action with irreversible consequences
    */
    DANGER = 4,
    /**
     * Navigates to a URL
    */
    LINK = 5,
    /**
     * Purchase
    */
    PREMIUM = 6
}

export enum SeparatorSpacingSize {
    Small = 1,
    Large = 2
}

export enum ComponentType {
    /**
     * Container to display a row of interactive components
     */
    ActionRow = 1,
    /**
     * Button component
     */
    Button = 2,
    /**
     * Select menu for picking from defined text options
     */
    StringSelect = 3,
    /**
     * Text Input component
     */
    TextInput = 4,
    /**
     * Select menu for users
     */
    UserSelect = 5,
    /**
     * Select menu for roles
     */
    RoleSelect = 6,
    /**
     * Select menu for users and roles
     */
    MentionableSelect = 7,
    /**
     * Select menu for channels
     */
    ChannelSelect = 8,
    /**
     * Container to display text alongside an accessory component
     */
    Section = 9,
    /**
     * Markdown text
     */
    TextDisplay = 10,
    /**
     * Small image that can be used as an accessory
     */
    Thumbnail = 11,
    /**
     * Display images and other media
     */
    MediaGallery = 12,
    /**
     * Displays an attached file
     */
    File = 13,
    /**
     * Component to add vertical padding between other components
     */
    Separator = 14,
    /**
     * @unstable This component type is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    ContentInventoryEntry = 16,
    /**
     * Container that visually groups a set of components
     */
    Container = 17,
    /**
     * Container associating a label and description with a component
     */
    Label = 18,
    /**
     * Component for uploading files
     */
    FileUpload = 19
}
