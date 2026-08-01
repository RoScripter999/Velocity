import type { ButtonVariant, Channel, Guild, GuildMember, Message, MessageAttachment, Poll, User, PostPayloads, GetPayloads, UserSettingsKeys } from ".";
import type { ReactNode } from "react";
import type { CamelCasedProperties, LiteralUnion, SnakeCasedProperties } from "type-fest";

/**
 * Merges a type with both its camelCase and snake_case property variants.
 * Use when you need a store-style type (camelCase) to also accept API-style (snake_case) props.
 *
 * @example
 * type Both = BothCases<User["avatarDecorationData"]>;
 * // Both now has skuId AND sku_id, expiresAt AND expires_at, etc.
 */
export type BothCases<T extends object> = T & CamelCasedProperties<T> & SnakeCasedProperties<T>;

/**
 * Converts a type of camelCase to API-style (snake_case)
 * @example
 * type ApiUser = ToApi<User>
 * // ApiUser now only has premium_state, premium_usage_flags, public_flags, etc.
 */
export type ToApi<T extends object> = SnakeCasedProperties<T>;

import type { FluxEvents } from "./fluxEvents";
import type { ApplicationCommandOptionType, ChannelType, PremiumType } from "../enums";
import type { MessageObject } from "@api/MessageEvents";
import type { MessageOptions } from "@utils/discord";

export { FluxEvents };

type FluxEventsAutoComplete = LiteralUnion<FluxEvents, string>;

export interface FluxDispatcher {
    _actionHandlers: any;
    _interceptors: any;
    _subscriptions: any;
    addInterceptor(interceptor: any): void;
    dispatch(event: { [key: string]: unknown; type: FluxEventsAutoComplete; }): Promise<void>;
    isDispatching(): boolean;
    subscribe(event: FluxEventsAutoComplete, callback: (data: any) => void): void;
    unsubscribe(event: FluxEventsAutoComplete, callback: (data: any) => void): void;
    wait(callback: () => void): void;
}

export type Parser = Record<
    | "parse"
    | "parseTopic"
    | "parseEmbedTitle"
    | "parseEmbedTitleWithoutLinks"
    | "parseInlineReply"
    | "parseGuildVerificationFormRule"
    | "parseGuildEventDescription"
    | "parseAutoModerationSystemMessage"
    | "parseForumPostGuidelines"
    | "parseForumPostMostRecentMessage"
    | "parseVoiceChannelStatus",
    (content: string, inline?: boolean, state?: Record<string, any>) => ReactNode[]
> & Record<
    | "parseToAST"
    | "parseTopicToAST"
    | "parseEmbedTitleToAST"
    | "parseEmbedTitleWithoutLinksToAST"
    | "parseInlineReplyToAST"
    | "parseAutoModerationSystemMessageToAST",
    (content: string, inline?: boolean, state?: Record<string, any>) => any[]
> & Record<"defaultRules" | "guildEventRules" | "notifCenterV2MessagePreviewRules" | "lockscreenWidgetMessageRules", Record<string, Record<"react" | "html" | "parse" | "match" | "order", any>>> & {
    reactParserFor(rules: Record<string, any>): (content: string, inline?: boolean, state?: Record<string, any>) => ReactNode[];
    astParserFor(rules: Record<string, any>): (content: string, inline?: boolean, state?: Record<string, any>) => any[];
    createReactRules(options: Record<string, any>): Record<string, any>;
    defaultReactRuleOptions: Record<string, any>;
    combineAndInjectMentionRule(rules: Record<string, any>, mentionRule: Record<string, any>): Record<string, any>;
};
export interface Alerts {
    show(alert: {
        title: any;
        body: ReactNode;
        confirmVariant?: ButtonVariant;
        /** Text of the cancel button, If not provided it wont render. */
        cancelText?: string;
        /** Text of the confirm button, If not provided it wont render. */
        confirmText?: string;
        onCancel?(): void;
        onConfirm?(): void;
        onCloseCallback?(): void;
        contextKey?: string;
    }): void;
    confirm(alert: {
        title: any;
        body: ReactNode;
        confirmVariant?: ButtonVariant;
        cancelText?: string;
        confirmText?: string;
        onCancel?(): void;
        onCloseCallback?(): void;
        contextKey?: string;
    }): Promise<boolean>;
    /** This is a noop, it does nothing. */
    close(): void;
}

export interface SnowflakeUtils {
    fromTimestamp(timestamp: number): string;
    fromTimestampWithSequence(timestamp: number, sequence: number): string;
    extractTimestamp(snowflake: string): number;
    age(snowflake: string): number;
    atPreviousMillisecond(snowflake: string): string;
    atNextMillisecond(snowflake: string): string;
    compare(snowflake1?: string, snowflake2?: string): number;
    isProbablyAValidSnowflake(snowflake: string): boolean;
    castChannelIdAsMessageId(channelId: string): string;
    castMessageIdAsChannelId(messageId: string): string;
    castGuildIdAsEveryoneGuildRoleId(guildId: string): string;
    cast(snowflake: string): string;
    keys(obj: Record<string, any>): string[];
    forEach(obj: Record<string, any>, callback: (value: any, key: string) => void): void;
    forEachKey(obj: Record<string, any>, callback: (key: string) => void): void;
    entries(obj: Record<string, any>): [string, any][];
}

export interface RestRequestData<TUrl extends string = string> {
    url: TUrl;
    query?: Record<string, unknown>;
    oldFormErrors?: boolean;
    rejectWithError?: boolean;
    retries?: number;
}

// TODO Make this better somehow
type RestRequestDataType<TUrl extends string> = TUrl extends PostPayloads["url"] ? Extract<PostPayloads, { url: TUrl; }> : RestRequestData<TUrl> & { body?: unknown; };

type ResponseData<TBody = any> = {
    headers: any;
    retryAfter?: number;
    status: number;
    text: string;
} & (
        { ok: true; body: TBody; } |
        { ok: false; body: { code: number; message: string; } & Record<string, any>; });

export type RestAPI = Record<'post' | 'patch' | 'put' | 'del', <TUrl extends PostPayloads["url"] | (string & {}) >(data: RestRequestDataType<TUrl>) => Promise<ResponseData>> & {
    // guh
    get: <TUrl extends string, TBody = string extends TUrl ? any : GetPayloads<TUrl>>(data: RestRequestData<TUrl>) => Promise<ResponseData<TBody>>;
};

export type Permissions = "CREATE_INSTANT_INVITE"
    | "KICK_MEMBERS"
    | "BAN_MEMBERS"
    | "ADMINISTRATOR"
    | "MANAGE_CHANNELS"
    | "MANAGE_GUILD"
    | "CHANGE_NICKNAME"
    | "MANAGE_NICKNAMES"
    | "MANAGE_ROLES"
    | "MANAGE_WEBHOOKS"
    | "MANAGE_GUILD_EXPRESSIONS"
    | "CREATE_GUILD_EXPRESSIONS"
    | "VIEW_AUDIT_LOG"
    | "VIEW_CHANNEL"
    | "VIEW_GUILD_ANALYTICS"
    | "VIEW_CREATOR_MONETIZATION_ANALYTICS"
    | "MODERATE_MEMBERS"
    | "USE_EMBEDDED_ACTIVITIES"
    | "USE_EXTERNAL_APPS"
    | "SEND_MESSAGES"
    | "SEND_TTS_MESSAGES"
    | "MANAGE_MESSAGES"
    | "EMBED_LINKS"
    | "ATTACH_FILES"
    | "READ_MESSAGE_HISTORY"
    | "MENTION_EVERYONE"
    | "USE_EXTERNAL_EMOJIS"
    | "ADD_REACTIONS"
    | "USE_APPLICATION_COMMANDS"
    | "MANAGE_THREADS"
    | "CREATE_PUBLIC_THREADS"
    | "CREATE_PRIVATE_THREADS"
    | "USE_EXTERNAL_STICKERS"
    | "SEND_MESSAGES_IN_THREADS"
    | "SEND_VOICE_MESSAGES"
    | "SEND_POLLS"
    | "PIN_MESSAGES"
    | "BYPASS_SLOWMODE"
    | "CONNECT"
    | "SPEAK"
    | "MUTE_MEMBERS"
    | "DEAFEN_MEMBERS"
    | "MOVE_MEMBERS"
    | "USE_VAD"
    | "PRIORITY_SPEAKER"
    | "STREAM"
    | "USE_SOUNDBOARD"
    | "USE_EXTERNAL_SOUNDS"
    | "SET_VOICE_CHANNEL_STATUS"
    | "REQUEST_TO_SPEAK"
    | "MANAGE_EVENTS"
    | "CREATE_EVENTS";

export type PermissionsBits = Record<Permissions, bigint>;

export interface MessageSnapshot {
    message: Message;
}

export type DiscordLocale = "da" | "de" | "en-GB" | "en-US" | "es-ES" | "es-419" | "fr" | "hr" | "it" | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr" | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko";
export type CodeLanguage = "1c" | "abnf" | "accesslog" | "actionscript" | "as" | "ada" | "angelscript" | "asc" | "apache" | "apacheconf" | "applescript" | "osascript" | "arcade" | "arduino" | "ino" | "armasm" | "arm" | "xml" | "html" | "xhtml" | "rss" | "atom" | "xjb" | "xsd" | "xsl" | "plist" | "wsf" | "svg" | "asciidoc" | "adoc" | "aspectj" | "autohotkey" | "ahk" | "autoit" | "avrasm" | "awk" | "axapta" | "x++" | "bash" | "sh" | "zsh" | "basic" | "bnf" | "brainfuck" | "bf" | "c" | "h" | "cal" | "capnproto" | "capnp" | "ceylon" | "clean" | "icl" | "dcl" | "clojure" | "clj" | "edn" | "clojure-repl" | "cmake" | "cmake.in" | "coffeescript" | "coffee" | "cson" | "iced" | "coq" | "cos" | "cls" | "cpp" | "cc" | "c++" | "h++" | "hpp" | "hh" | "hxx" | "cxx" | "crmsh" | "crm" | "pcmk" | "crystal" | "cr" | "csharp" | "cs" | "c#" | "csp" | "css" | "d" | "markdown" | "md" | "mkdown" | "mkd" | "dart" | "delphi" | "dpr" | "dfm" | "pas" | "pascal" | "diff" | "patch" | "django" | "jinja" | "dns" | "bind" | "zone" | "dockerfile" | "docker" | "dos" | "bat" | "cmd" | "dsconfig" | "dts" | "dust" | "dst" | "ebnf" | "elixir" | "ex" | "exs" | "elm" | "ruby" | "rb" | "gemspec" | "podspec" | "thor" | "irb" | "erb" | "erlang-repl" | "erlang" | "erl" | "excel" | "xlsx" | "xls" | "fix" | "flix" | "fortran" | "f90" | "f95" | "fsharp" | "fs" | "f#" | "gams" | "gms" | "gauss" | "gss" | "gcode" | "nc" | "gherkin" | "feature" | "glsl" | "gml" | "go" | "golang" | "golo" | "gradle" | "graphql" | "gql" | "groovy" | "haml" | "handlebars" | "hbs" | "html.hbs" | "html.handlebars" | "htmlbars" | "haskell" | "hs" | "haxe" | "hx" | "hsp" | "http" | "https" | "hy" | "hylang" | "inform7" | "i7" | "ini" | "toml" | "irpf90" | "isbl" | "java" | "jsp" | "javascript" | "js" | "jsx" | "mjs" | "cjs" | "jboss-cli" | "wildfly-cli" | "json" | "jsonc" | "julia" | "julia-repl" | "jldoctest" | "kotlin" | "kt" | "kts" | "lasso" | "ls" | "lassoscript" | "latex" | "tex" | "ldif" | "leaf" | "less" | "lisp" | "livecodeserver" | "livescript" | "llvm" | "lsl" | "lua" | "pluto" | "makefile" | "mk" | "mak" | "make" | "mathematica" | "mma" | "wl" | "matlab" | "maxima" | "mel" | "mercury" | "m" | "moo" | "mipsasm" | "mips" | "mizar" | "perl" | "pl" | "pm" | "mojolicious" | "monkey" | "moonscript" | "moon" | "n1ql" | "nestedtext" | "nt" | "nginx" | "nginxconf" | "nim" | "nix" | "nixos" | "node-repl" | "nsis" | "objectivec" | "mm" | "objc" | "obj-c" | "obj-c++" | "objective-c++" | "ocaml" | "ml" | "openscad" | "scad" | "oxygene" | "parser3" | "pf" | "pf.conf" | "pgsql" | "postgres" | "postgresql" | "php" | "php-template" | "plaintext" | "text" | "txt" | "pony" | "powershell" | "pwsh" | "ps" | "ps1" | "processing" | "pde" | "profile" | "prolog" | "properties" | "protobuf" | "proto" | "puppet" | "pp" | "purebasic" | "pb" | "pbi" | "python" | "py" | "gyp" | "ipython" | "python-repl" | "pycon" | "q" | "k" | "kdb" | "qml" | "qt" | "r" | "reasonml" | "re" | "rib" | "roboconf" | "graph" | "instances" | "routeros" | "mikrotik" | "rsl" | "ruleslanguage" | "rust" | "rs" | "sas" | "scala" | "scheme" | "scm" | "scilab" | "sci" | "scss" | "shell" | "console" | "shellsession" | "smali" | "smalltalk" | "st" | "sml" | "sqf" | "sql" | "stan" | "stanfuncs" | "stata" | "do" | "ado" | "step21" | "p21" | "step" | "stp" | "stylus" | "styl" | "subunit" | "swift" | "taggerscript" | "yaml" | "yml" | "tap" | "tcl" | "tk" | "thrift" | "tp" | "twig" | "craftcms" | "typescript" | "ts" | "tsx" | "mts" | "cts" | "vala" | "vbnet" | "vb" | "vbscript" | "vbs" | "vbscript-html" | "verilog" | "v" | "sv" | "svh" | "vhdl" | "vim" | "wasm" | "wren" | "x86asm" | "xl" | "tao" | "xquery" | "xpath" | "xq" | "xqm" | "zephir" | "zep" | "ansi";

export interface Locale {
    name: string;
    value: string;
    localizedName: string;
}

export interface SettingsRouter {
    get USER_SETTINGS_MODAL_KEY(): "USER_SETTINGS_MODAL_MODAL_KEY";
    openUserSettings(target?: UserSettingsKeys | LiteralUnion<`velocity_${string}`, never>): Promise<void>;
}

export interface NavigationRouter {
    back(): void;
    forward(): void;
    transitionTo(path: string, ...args: unknown[]): void;
    transitionToGuild(guildId: string, ...args: unknown[]): void;
}

export interface ChannelRouter {
    transitionToChannel: (channelId: string) => void;
    transitionToThread: (channel: Channel) => void;
}

export interface IconUtils {
    getUserAvatarURL(user: { id: string; avatar?: ?string; }, canAnimate?: boolean, size?: number, format?: string): string;
    getDefaultAvatarURL(id: string, discriminator?: string): string;
    getUserBannerURL(data: { id: string, banner: string, canAnimate?: boolean, size: number; }): string | undefined;
    getAvatarDecorationURL(data: { avatarDecoration: User["avatarDecoration"] | ToApi<NonNullable<User["avatarDecoration"]>>; size: number; canAnimate?: boolean; }): string | undefined;

    getGuildMemberAvatarURL(member: GuildMember, canAnimate?: string): string | null;
    getGuildMemberAvatarURLSimple(data: { guildId: string, userId: string, avatar: string, canAnimate?: boolean; size?: number; }): string;
    getGuildMemberBannerURL(data: { id: string, guildId: string, banner: string, canAnimate?: boolean, size: number; }): string | undefined;

    getGuildIconURL(data: { id: string, icon?: string, size?: number, canAnimate?: boolean; }): string | undefined;
    getGuildBannerURL(guild: Guild, canAnimate?: boolean): string | null;

    getChannelIconURL(data: { id: string; icon?: string; applicationId?: string; size?: number; }): string | undefined;
    getEmojiURL(data: { id: string, animated: boolean, size: number, forcePNG?: boolean; }): string;

    hasAnimatedGuildIcon(guild: Guild): boolean;
    isAnimatedIconHash(hash: string): boolean;

    getGuildSplashURL: any;
    getGuildDiscoverySplashURL: any;
    getGuildHomeHeaderURL: any;
    getResourceChannelIconURL: any;
    getNewMemberActionIconURL: any;
    getGuildTemplateIconURL: any;
    getApplicationIconURL: any;
    getGameAssetURL: any;
    getVideoFilterAssetURL: any;

    getGuildMemberAvatarSource: any;
    getUserAvatarSource: any;
    getGuildSplashSource: any;
    getGuildDiscoverySplashSource: any;
    makeSource: any;
    getGameAssetSource: any;
    getGuildIconSource: any;
    getGuildTemplateIconSource: any;
    getGuildBannerSource: any;
    getGuildHomeHeaderSource: any;
    getChannelIconSource: any;
    getApplicationIconSource: any;
    getAnimatableSourceWithFallback: any;
}

export interface Constants {
    Endpoints: Record<string, any>;
    FriendsSections: Record<string, string>;
    UserFlags: Record<string, number>;
}

export type ActiveView = LiteralUnion<"emoji" | "gif" | "sticker" | "soundboard", string>;

export interface ExpressionPickerStoreState extends Record<PropertyKey, any> {
    activeView: ActiveView | null;
    lastActiveView: ActiveView | null;
    activeViewType: any | null;
    searchQuery: string;
    isSearchSuggestion: boolean,
    pickerId: string;
}

export interface ExpressionPickerStore {
    openExpressionPicker(activeView: ActiveView, activeViewType?: any): void;
    closeExpressionPicker(activeViewType?: any): void;
    toggleMultiExpressionPicker(activeViewType?: any): void;
    toggleExpressionPicker(activeView: ActiveView, activeViewType?: any): void;
    setExpressionPickerView(activeView: ActiveView): void;
    setSearchQuery(searchQuery: string, isSearchSuggestion?: boolean): void;
    useExpressionPickerStore(): ExpressionPickerStoreState;
    useExpressionPickerStore<T>(selector: (state: ExpressionPickerStoreState) => T): T;
}

export type UserNameUtilsTagInclude = LiteralUnion<"auto" | "always" | "never", string>;
export interface UserNameUtilsTagOptions {
    forcePomelo?: boolean;
    identifiable?: UserNameUtilsTagInclude;
    decoration?: UserNameUtilsTagInclude;
    mode?: "full" | "username";
}

export interface UsernameUtils {
    getGlobalName(user: User): string;
    getFormattedName(user: User, useTagInsteadOfUsername?: boolean): string;
    getName(user: User): string;
    useName(user: User): string;
    getUserTag(user: User, options?: UserNameUtilsTagOptions): string;
    useUserTag(user: User, options?: UserNameUtilsTagOptions): string;
    isNameConcealed(user: User): boolean;
    getUserIsStaff(user: User): boolean;
    useDirectMessageRecipient: any;
    humanizeStatus: any;
}

export class DisplayProfile {
    userId: string;
    guildId?: string;
    banner?: string;
    bio?: string;
    pronouns?: string;
    accentColor?: number;
    themeColors?: number[];
    profileEffect?: any;
    popoutAnimationParticleType?: any;
    fetchStartedAt?: Date | null;
    fetchEndedAt?: Date | null;
    _userProfile?: any;
    _guildMemberProfile?: any;

    get premiumSince(): Date | null;
    get premiumGuildSince(): Date | null;
    get premiumType(): PremiumType | undefined;
    get private(): boolean;
    get widgets(): any[] | undefined;
    get gameWidgets(): any[] | undefined;
    get primaryColor(): number | undefined;
    get canUsePremiumProfileCustomization(): boolean;
    get canEditThemes(): boolean;
    get application(): any;
    get isLoaded(): boolean;

    hasThemeColors(): boolean;
    hasPremiumCustomization(): boolean;
    isUsingGuildMemberBanner(): boolean;
    isUsingGuildMemberBio(): boolean;
    isUsingGuildMemberPronouns(): boolean;
    getBannerURL(options: { canAnimate: boolean; size: number; }): string;
    getPreviewBanner(banner: string | null, canAnimate: boolean, size?: number): string | null;
    getPreviewBio(bio: string | undefined): string | undefined;
    getPreviewThemeColors(themeColors: number[] | undefined): number[] | undefined;
    getBadges(): Array<{
        id: string;
        description: string;
        icon: string;
        link?: string;
    }>;
    getLegacyUsername(): string | null;
}

export interface DisplayProfileUtils {
    getDisplayProfile(userId: string, guildId?: string, customStores?: any): DisplayProfile | null;
    useDisplayProfile(userId: string, guildId?: string, customStores?: any): DisplayProfile | null;
}

export interface DateUtils {
    isSameDay(date1: Date, date2: Date): boolean;
    calendarFormat(date: Date): string;
    dateFormat(date: Date, format: string): string;
    diffAsUnits(start: Date, end: Date, stopAtOneSecond?: boolean): Record<"days" | "hours" | "minutes" | "seconds", number>;
}

export interface CommandOptions {
    type: ApplicationCommandOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: {
        name: string;
        values: string | number;
    }[];
    options?: CommandOptions[];
    channel_types?: ChannelType[];
    min_value?: number;
    max_value?: number;
    autocomplete?: boolean;
}

export interface URLUtils {
    URL_REGEX: RegExp;
    makeUrl(url: string): URL | null;
    isDiscordUrl(url: string): boolean;
    isDiscordCdnUrl(url: string): boolean;
    isDiscordAssetUrl(url: string, proxyUrl?: string, originalUrl?: string): boolean;
    isDiscordDirectAssetUrl(url: string): boolean;
    isDiscordProxiedAssetUrl(url: string, proxyUrl?: string, originalUrl?: string): boolean;
    isDiscordHostname(hostname: string): boolean;
    isDiscordLocalhost(hostname: string): boolean;
    isDiscordProtocol(url: string): boolean;
    isDiscordUri(url: string): boolean;
    isDiscordUrlOrUri(url: string): boolean;
    isAllowedGifProviderUrl(url: string): boolean;
    isAppRoute(url: string): boolean;
    isOriginalContentTypeDifferent(url: string, proxyUrl: string): boolean;
    toURLSafe(url: string): URL | null;
    safeDecodeURIComponent(component: string): string;
    safeParseWithQuery(url: string): URL | null;
    format(url: URL): string;
    formatPathWithQuery(path: string, query: Record<string, string>): string;
    formatSearch(query: Record<string, string>): string;
}

export interface MessageActionCreators {
    receiveMessage(channelId: string, message: Message, optimistic?: boolean, sendMessageOptions?: MessageOptions): void;
    sendBotMessage(channelId: string, content: string, loggingName?: string, messageId?: string): void;
    sendNitroSystemMessage(channelId: string, content: string, nonce?: string): void;
    sendGiftingPromptSystemMessage(channelId: string, giftingPrompt: any): void;
    sendGuildBoostUpsellSystemMessage(channelId: string, boostingPrompt: any): void;
    sendClydeError(channelId: string, code?: number): void;
    sendExplicitMediaClydeError(channelId: string, attachments?: MessageAttachment[], context?: any): void;
    truncateMessages(channelId: string, truncateBottom?: boolean, truncateTop?: boolean): void;
    clearChannel(channelId: string): void;
    jumpToPresent(channelId: string, limit?: number): void;
    trackJump(channelId: string, messageId: string | null, context: string, extraProperties?: any): void;
    jumpToMessage(options: {
        channelId: string;
        messageId: string;
        flash?: boolean;
        offset?: number;
        context?: string;
        extraProperties?: any;
        isPreload?: boolean;
        returnMessageId?: string;
        skipLocalFetch?: boolean;
        jumpType?: any;
        avoidInitialScroll?: boolean;
    }): void;
    focusMessage(options: { channelId: string; messageId: string; }): void;
    fetchMessage(options: { channelId: string; messageId: string; }): Promise<any>;
    fetchMessages(options: {
        channelId: string;
        before?: string;
        after?: string;
        limit?: number;
        jump?: any;
        focus?: any;
        isPreload?: boolean;
        skipLocalFetch?: boolean;
        truncate?: boolean;
        forICYMI?: boolean;
        avoidInitialScroll?: boolean;
        feature?: string;
        fetchKey?: number;
    }): void;
    sendMessage(channelId: string, message: MessageObject | {}, waitForReady?: boolean, options?: Partial<MessageOptions>): Promise<any>;
    getSendMessageOptionsForReply(pendingReply?: any): any;
    getSendMessageOptionsForStickers(options: { isGif?: boolean; stickers?: string[]; }): any;
    getSendMessageOptionsForScheduledMessage(options: { scheduledTimestamp?: number; }): any;
    getSendMessageOptionsForAlsoForwardToChannel(options: { alsoForwardToChannelId?: string; }): any;
    getSendMessageOptions(options?: any): any;
    sendInvite(channelId: string, inviteCode: string, location?: string, inviteAnalyticsMetadata?: any, prependContent?: string): void;
    sendActivityBookmark(channelId: string, content: string, location?: string, inviteAnalyticsMetadata?: any): void;
    sendStickers(channelId: string, stickerIds: string[], content?: string, options?: any, tts?: boolean): void;
    sendGreetMessage(channelId: string, stickerId: string, options?: any): Promise<any>;
    sendPollMessage(channelId: string, poll: any, options?: Poll): void;
    validateMessage(emojis: any[], user: User, channelId: string): { errorMessage: string; errorMessageName: string; };
    startEditMessage(channelId: string, messageId: string, content?: string, source?: string): Promise<any>;
    editMessage(channelId: string, messageId: string, options: { content?: string; components?: any[]; }): Promise<any>;
    suppressEmbeds(channelId: string, messageId: string): Promise<void>;
    patchMessageGuildOfficial(channelId: string, messageId: string, isOfficial: boolean): Promise<void>;
    patchMessageAttachments(channelId: string, messageId: string, attachments: any[]): Promise<void>;
    /** @param instant Only dispatches a MESSAGE_DELETE, does not make a request. */
    deleteMessage(channelId: string, messageId: string, instant?: boolean): Promise<void>;
    dismissAutomatedMessage(message: Message): void;
    revealMessage(channelId: string, messageId: string): void;
    crosspostMessage(channelId: string, messageId: string): Promise<any>;
    trackInvite(inviteData: any): void;
}
