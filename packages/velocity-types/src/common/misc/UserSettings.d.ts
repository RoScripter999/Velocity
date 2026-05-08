import { ButtonVariant, SelectOption, Select } from "../../components";
import { InlineNoticeType, LayoutType } from "../../../enums";
import { ComponentType, JSX, ReactNode } from "react";

// copy(Object.values(find(m => m?.X?.PROFILE_SETTING === "profile_setting").X).map(v => `"${v}"`).join("|"))
export type UserSettingsKeys = "profile_section" | "profile_sidebar_item" | "profile_sidebar_item_wysiwyg" | "profile_panel" | "profile_category" | "profile_setting" | "user_section" | "account_sidebar_item" | "account_panel" | "account_security_tab" | "account_profile_category" | "account_profile_setting" | "account_password_security_category" | "account_authentication_category" | "account_two_factor_crypto_notice" | "account_unverified_user_notice" | "account_enable_mfa_setting" | "account_change_password_setting" | "account_authenticator_app_setting" | "account_backup_codes_setting" | "account_sms_backup_authentication_setting" | "account_security_keys_setting" | "account_sessions_nested_panel" | "account_mfa_nested_panel" | "multi_factor_authentication" | "security_keys_category" | "security_keys_list" | "authenticator_app_category" | "authenticator_app_disable_button" | "sms_auth_category" | "sms_auth_disable_button" | "backup_codes_category" | "backup_codes_setting" | "account_standing_nested_panel" | "account_standing_nested_category" | "account_standing_panel" | "account_info_category" | "account_info_username_setting" | "account_info_email_setting" | "account_info_claim_account_setting" | "account_info_phone_setting" | "account_info_age_group_verify_setting" | "account_info_age_group_edit_setting" | "account_info_age_group_info_setting" | "account_removal_category" | "account_removal_setting" | "account_disable_setting" | "account_delete_setting" | "account_standing_tab" | "account_standing_category" | "account_standing_setting" | "account_family_center_category" | "account_family_center_nested_panel" | "content_and_social_sidebar_item" | "content_and_social_panel" | "content_and_social_main_tab" | "content_and_social_connected_games_tab" | "content_and_social_content_category" | "content_and_social_permissions_category" | "content_and_social_friend_requests_category" | "content_and_social_restricted_users_category" | "content_and_social_connected_games_category" | "content_and_social_content_filters_setting" | "content_and_social_dm_spam_setting" | "content_and_social_dm_safety_alerts_setting" | "content_and_social_age_restricted_dm_setting" | "content_and_social_age_restricted_ios_setting" | "content_and_social_permissions_guild_selector" | "content_and_social_permissions_dms_setting" | "content_and_social_permissions_message_requests_setting" | "content_and_social_permissions_activity_share_setting" | "content_and_social_permissions_activity_join_setting" | "content_and_social_friend_requests_everyone_setting" | "content_and_social_friend_requests_mutual_friends_setting" | "content_and_social_friend_requests_mutual_guilds_setting" | "content_and_social_blocked_users" | "content_and_social_ignored_users" | "content_and_social_connected_games" | "content_and_social_allow_game_friend_dms_setting" | "content_and_social_in_game_dms_setting" | "data_and_privacy_sidebar_item" | "data_and_privacy_panel" | "profile_privacy_category" | "profile_privacy_setting" | "profile_privacy_related_settings" | "profile_privacy_to_activity_privacy_navigator" | "data_usage_category" | "data_usage_statistics_setting" | "data_usage_quests_setting" | "data_usage_quests_3p_setting" | "data_usage_personalization_setting" | "data_usage_disclaimer_setting" | "data_usage_activity_privacy_navigator" | "data_usage_related_settings" | "data_request_category" | "data_harvest_request_setting" | "voice_security_category" | "persistent_verification_codes_setting" | "users_verified_keys_list_setting" | "clips_allow_voice_recording_setting" | "family_center_sidebar_item" | "family_center_panel" | "family_center_category" | "family_center_setting" | "sessions_sidebar_item" | "sessions_panel" | "sessions_sessions_category" | "sessions_current_session_setting" | "sessions_other_sessions_setting" | "sessions_logout_all_sessions_setting" | "authorized_apps_sidebar_item" | "authorized_apps_panel" | "authorized_apps_category" | "authorized_apps_list_setting" | "connections_sidebar_item" | "connections_panel" | "connections_add_connections_category" | "connections_add_connections_setting" | "connections_connected_accounts_category" | "connections_connected_accounts_setting" | "notifications_sidebar_item" | "notifications_panel" | "notifications_overview_category" | "notification_selection_field_set" | "desktop_notifications" | "go_live_notifications" | "reaction_notifications" | "gdm_all_reaction_notifications" | "friend_online_notifications" | "profile_updates_notifications" | "game_update_notifications" | "friend_anniversary_notifications" | "server_trending_notifications" | "upcoming_server_event_notifications" | "experimental_unreads" | "notifications_sounds_category" | "notification_holiday_soundpack" | "notification_sounds_list" | "notifications_sounds_related_settings" | "notifications_to_voice_and_video_sounds_navigator" | "sounds_list_item_" | "selected_channel_notifications" | "disable_all_notification_sounds" | "notifications_badges_category" | "enable_unread_message_badge" | "task_bar_flashing" | "notifications_email_category" | "email_list_item_" | "unsubscribe_from_all_marketing_emails" | "notifications_advanced_category" | "notifications_advanced_accordion" | "mobile_notification_delay" | "text_to_speech_command" | "text_to_speech_notifications" | "clips_sidebar_item" | "clips_panel" | "clips_recording_category" | "clips_hardware_classification_warning" | "clips_quality_infobox" | "clips_enable" | "clips_enable_decoupled_clipping" | "clips_enable_reminders" | "clips_clear_reminder_snooze" | "clips_length" | "clips_resolution" | "clips_frame_rate" | "clips_keybind" | "clips_screenshot_keybind" | "clips_storage_location" | "clips_automatic_clipping_category" | "clips_auto_clip_storage_limit" | "clips_enable_game_signals" | "clips_enable_phrase_signals" | "clips_phrases" | "billing_section" | "nitro_sidebar_item" | "nitro_panel" | "nitro_category" | "nitro_setting" | "premium_guild_subscriptions_sidebar_item" | "premium_guild_subscriptions_panel" | "premium_guild_subscriptions_category" | "premium_guild_subscriptions_setting" | "subscriptions_sidebar_item" | "subscriptions_panel" | "subscriptions_category" | "subscriptions_settings" | "gift_sidebar_item" | "gift_panel" | "gift_inventory_category" | "gift_code_redemption_setting" | "gift_inventory_list_setting" | "gift_blocked_payments_setting" | "billing_sidebar_item" | "billing_panel" | "billing_payment_methods_category" | "billing_payment_methods" | "billing_store_country_category" | "billing_store_country" | "billing_transaction_history_category" | "billing_transaction_history" | "app_section" | "appearance_sidebar_item" | "appearance_panel" | "appearance_theme_category" | "appearance_theme_fieldset" | "appearance_default_themes" | "appearance_dark_sidebar" | "appearance_custom_themes_upsell" | "appearance_client_themes" | "appearance_sync_theme" | "sync_profile_themes" | "appearance_theme_related_settings" | "appearance_theme_accessibility_navigator" | "appearance_in_app_icon_category" | "appearance_in_app_icon" | "appearance_messages_category" | "chat_inline_media_field_set" | "chat_inline_media_links" | "chat_inline_media_uploads" | "chat_embeds_render_embeds" | "chat_emoji_render_reactions" | "chat_spoilers_show_spoilers" | "chat_threads_split_view" | "appearance_display_compact_avatars" | "chat_favorites_toggle" | "appearance_chat_related_settings" | "appearance_chat_accessibility_navigator" | "appearance_chat_box_category" | "chat_text_box_previews" | "chat_emoji_convert_emoticons" | "chat_stickers_autocomplete" | "enable_send_button" | "appearance_search_category" | "message_search_default_dm_search_behavior" | "streamer_mode_category" | "streaming_enable_streamer_mode" | "streaming_auto_streamer_mode" | "streamer_mode_options_list" | "streamer_mode_hide_personal_information" | "streamer_mode_hide_invite_links" | "streamer_mode_disable_sounds" | "streamer_mode_disable_notifications" | "streamer_mode_hide_discord_window_from_screen_capture" | "streamer_mode_hide_overlay_widgets" | "appearance_advanced_category" | "hardware_acceleration" | "show_game_library" | "accessibility_sidebar_item" | "accessibility_panel" | "text_readability_category" | "appearance_font_scaling" | "underline_links" | "display_name_styles" | "visual_density_category" | "appearance_ui_density" | "appearance_message_display_mode" | "appearance_message_group_spacing" | "appearance_zoom" | "color_and_contrast_category" | "saturation" | "desaturate_custom_colors" | "high_contrast_mode" | "enable_custom_cursor" | "sync_forced_colors" | "high_dynamic_range" | "role_style" | "enable_switch_icons" | "color_and_contrast_related_settings" | "accessibility_to_display_navigator" | "motion" | "reduced_motion" | "sync_reduced_motion" | "animate_gifs" | "animate_emojis" | "animate_stickers" | "audio_and_screen_reader_category" | "tts_playback_rate" | "chat_inline_media_image_descriptions" | "enable_legacy_chat_input" | "voice_and_video_sidebar_item" | "voice_and_video_panel" | "voice_category" | "voice_input_output_device_split" | "voice_microphone_input_select" | "voice_speakers_output_select" | "voice_input_output_volume_split" | "voice_input_volume_setting" | "voice_output_volume_setting" | "voice_microphone_test_setting" | "voice_input_profile_category" | "voice_input_profile_setting" | "voice_push_to_talk_setting" | "voice_push_to_talk_keybind_setting" | "voice_push_to_talk_release_delay_setting" | "voice_noise_suppression_setting" | "input_profile_voice_advanced_accordion" | "voice_input_sensitivity_field_set" | "voice_echo_cancellation_setting" | "advanced_voice_activity_processing_setting" | "voice_automatic_gain_control_setting" | "voice_bypass_system_input_processing_setting" | "voice_silence_warning_setting" | "voice_switch_channel_alert_setting" | "voice_hardware_mute_silence_alert_setting" | "voice_global_attenuation_field_set" | "voice_global_attenuation_slider" | "voice_global_attenuation_for_self_setting" | "voice_global_attenuation_for_others_setting" | "voice_audio_subsystem_setting" | "voice_quality_of_service_setting" | "camera_category" | "camera_video_preview" | "camera_preview_preference" | "camera_selection_setting" | "camera_background_setting" | "streaming_category" | "streaming_show_stream_previews" | "streaming_advanced_accordion" | "streaming_stream_attenuation" | "streaming_stream_attenuation_strength" | "streaming_os_menu_screen_capture" | "streaming_experimental_soundshare" | "streaming_advanced_screenshare" | "voice_and_video_diagnostics_category" | "voice_and_video_diagnostics_accordion" | "voice_and_video_stream_info_overlay" | "voice_and_video_audio_recording" | "voice_and_video_record_connection_replay" | "voice_and_video_open_connection_replay" | "voice_and_video_debug_logging" | "voice_and_video_openh264" | "voice_and_video_reset_all_settings" | "sounds_category" | "voice_and_video_sounds_list" | "sounds_holiday_notice" | "voice_and_video_sounds_related_settings" | "voice_and_video_to_notification_sounds_navigator" | "soundboard_category" | "soundboard_volume_setting" | "soundmoji_volume_setting" | "entrance_sounds_setting" | "poggermode_sidebar_item" | "poggermode_panel" | "poggermode_category" | "poggermode_setting" | "system_sidebar_item" | "system_panel" | "system_general_category" | "system_custom_keybinds_category" | "custom_keybinds_setting" | "system_default_keybinds_category" | "default_keybinds_setting" | "system_helper_category" | "keybinds_sidebar_item" | "keybinds_panel" | "keybinds_category" | "keybinds_setting" | "language_and_time_panel" | "language_and_time_category" | "language_and_time_sidebar_item" | "language_select_setting" | "time_format_setting" | "windows_sidebar_item" | "windows_panel" | "windows_category" | "linux_category" | "os_open_on_startup" | "os_start_minimized" | "os_minimize_to_tray" | "os_system_service" | "linux_sidebar_item" | "linux_panel" | "activity_section" | "activity_privacy_sidebar_item" | "activity_privacy_panel" | "activity_sharing_category" | "activity_sharing_per_guild_category" | "activity_sharing_per_guild_default_setting" | "activity_sharing_per_guild_setting" | "activity_sharing_my_servers_category" | "activity_privacy_related_settings" | "activity_privacy_to_profile_privacy_navigator" | "activity_sharing_game_joining_category" | "activity_sharing_terms_category" | "activity_privacy_setting" | "activity_privacy_friends_join_setting" | "activity_privacy_voice_join_setting" | "activity_privacy_terms" | "registered_games_sidebar_item" | "registered_games_panel" | "registered_games_current_game_category" | "registered_games_added_games_category" | "registered_games_current_game_setting" | "registered_games_add_game_setting" | "registered_games_added_games_setting" | "overlay_sidebar_item" | "overlay_panel" | "overlay_enable_category" | "overlay_current_game" | "overlay_oop_setting" | "overlay_legacy_setting" | "overlay_bug_reporter_setting" | "overlay_general_category" | "overlay_keybind_setting" | "overlay_limited_interaction_override_setting" | "overlay_clickable_regions_setting" | "overlay_voice_widget_category" | "overlay_voice_widget_preview" | "overlay_voice_widget_avatar_size" | "overlay_voice_widget_display_names" | "overlay_voice_widget_display_users" | "overlay_voice_widget_max_users" | "overlay_notifications_category" | "overlay_notifications_list" | "overlay_notifications_text_chat" | "overlay_notifications_welcome" | "overlay_notifications_go_live" | "overlay_notifications_game_activity" | "overlay_notifications_now_playing" | "overlay_notifications_now_playing_different_games" | "developer_section" | "experiments_sidebar_item" | "experiments_panel" | "experiments_category" | "experiments_setting" | "developer_options_sidebar_item" | "developer_options_panel" | "load_source_maps" | "build_overrides" | "dev_overrides" | "premium_type_override" | "survey_override" | "change_log_override" | "change_log_clear" | "force_canary_api" | "ad_override" | "only_show_preview_app_collections" | "disable_app_collections_cache" | "logging" | "gateway_logs" | "overlay_rpc_logs" | "analytics_logs" | "keyboard_mismatches" | "request_tracing" | "keep_popouts_open" | "quest_logging" | "design_tools" | "css_debugging" | "layout_debugging" | "layout_debugging_horizontal_spacing" | "layout_debugging_vertical_spacing" | "highlight_mana_components" | "highlight_void_components" | "axe_auditing" | "utility_section" | "developer_sidebar_item" | "developer_panel" | "developer_category" | "developer_mode" | "application_test_mode" | "logout_sidebar_item";

interface LayoutNode {
    type: LayoutType;
    key?: string;
    /**
     * @ignore Used for external mapping. This node will route to {@link LayoutType.ROOT $Root}.
     * You probably don't need this, It is read-only so changing it won't work.
     * If this node is a {@link SidebarItemNode} for example, It will show something like this
     * @example
     * {
     *     key: "velocity_section",
     *     type: LayoutType.PANEL,
     *     layout: [{...}, {...}, {...}, {...}]
     *     parent: {
     *      analyticsKey: "user_settings",
     *      key: "$Root",
     *      layout: [{...}, {...}, {...}, {...}],
     *      type: LayoutType.ROOT
     *     }
     * }
     */
    readonly parent?: Readonly<ContentNode>;
    /**
     * Search terms used to find this node in the settings search.
     * Automatically populated with the result of {@link useTitle} if present.
     * Add extra terms here for aliases or related keywords that aren't in the title.
     * @example
     * {
     *     key: "my_panel_key",
     *     type: LayoutType.PANEL,
     *     useTitle: () => "My Panel",
     *     useSearchTerms: () => ["alias", "related keyword"]
     * }
     */
    useSearchTerms?(): string[];
}

interface LayoutBuilderNode extends LayoutNode {
    buildLayout(): ContentNode[];
}

/**
 * @ignore Used internally by Discord's user settings modules.
 * Only use this if you are building a custom layout system.
 */
interface RootNode extends LayoutNode {
    type: LayoutType.ROOT;
    buildLayout(): SectionNode[];
}

export interface SectionNode extends LayoutNode {
    type: LayoutType.SECTION;
    /* Moves the section above the Profile Customization button */
    hoisted?: boolean;
    useTitle?(): ReactNode | string;
    buildLayout(): SidebarItemNode[];
}

export interface SidebarItemNode extends LayoutBuilderNode {
    type: LayoutType.SIDEBAR_ITEM;
    useTitle(): ReactNode | string;
    buildLayout(): PanelNode[];
    usePredicate?(): boolean;
    icon(): ReactNode;
    /** @override When used, {@link useTitle} and {@link icon} Disappear, rendering a custom component. */
    StronglyDiscouragedCustomComponent?(): ReactNode;
    /** Color of the button. @default "default" */
    variant?: "default" | "destructive";
}

/**
 * Only renders if there is {@link CategoryNode} in {@link buildLayout}.
 * Any other {@link ContentNode node} will result in a "Panels must have a list of categories or a list of tabs" crash.
 *
 * {@link buildLayout} Gets converted into "layout" at runtime, Using "layout" will be the same as {@link buildLayout}.
 */
export interface PanelNode extends LayoutBuilderNode {
    type: LayoutType.PANEL;
    notice?: InlineNoticeNode;
    decoration?: DecorationNode;
    useTitle(): ReactNode | string;
    buildLayout(): (CategoryNode | TabItemNode)[];
    useInlineNotice?: () => InlineNoticeNode[];
    useObscuredNotice?: () => ComponentType<any>;
}

export interface SplitNode {
    type: LayoutType.SPLIT;
    layout: ContentNode[];
}

export interface CategoryNode extends LayoutBuilderNode {
    type: LayoutType.CATEGORY;
    useTitle?(): ReactNode | string;
    buildLayout?(): ContentNode[];
    useSubtitle?(): ReactNode | string;
    /** Changes the label Subnav category button from the default value of {@link useTitle} */
    useSubnavLabel?(): ReactNode | string;
    /**
     * Creates a notice under the {@link useSubtitle} or {@link useTitle}
     * @see {@link InlineNoticeType}.
     */
    useInlineNotice?(): InlineNoticeNode;
    useHeaderDecoration?(): ReactNode;
    /**
     * @ignore Only use when rendering category inside a {@link TabItemNode}.
     * Using a {@link layout} outside of a {@link TabItemNode} will result in a "{@link type 10} nodes should never be rendered directly" crash.
     * Using {@link buildLayout} inside a {@link TabItemNode} will result in a "Cannot read properties of undefined (reading 'map')" crash.
     */
    layout?: ContentNode[];
    icon?: ComponentType<any>;
}

export interface AccordionNode extends LayoutNode {
    type: LayoutType.ACCORDION;
    layout: ContentNode[];
    useTitle: (isExpanded?: boolean) => string;
    useCollapsedSubtitle?: () => string;
    isExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    animate?: boolean;
}

export interface ListNode extends LayoutNode {
    type: LayoutType.LIST;
    layout: ContentNode[];
    collapseAfter?: number;
    useCollapsibleTitle?: (isExpanded: boolean, hiddenCount: number) => string;
    useCollapsedSubtitle?: () => string;
}

export interface RelatedNode extends LayoutNode {
    type: LayoutType.RELATED;
    layout: ContentNode[];
}

export interface FieldSetNode extends LayoutNode {
    type: LayoutType.FIELD_SET;
    useTitle(): string;
    useSubtitle?(): string;
    layout: ContentNode[];
    variant?: "default" | "compact";
    isTitleHiddenVisually?: boolean;
}

/**
 * Nodes are rendered in the {@link layout} and **MUST** use "layout", NOT buildLayout.
 * If {@link TabItemNode} is rendered within a {@link CategoryNode} It would cause the 10 nodes error
 */
export interface TabItemNode extends LayoutNode {
    type: LayoutType.TAB_ITEM;
    getTitle(): string;
    onItemSelect?: () => void;
    /** Does not require to have a {@link CategoryNode} on top level. Only {@link PanelNode panels} do. */
    layout: ContentNode[];
}

/**
 * Only renders if there is {@link PanelNode} in {@link buildLayout}.
 * Any other {@link ContentNode node} will result in a Invariant Violation error.
 */
export interface NestedPanelNode extends LayoutNode {
    type: LayoutType.NESTED_PANEL;
    buildLayout: () => PanelNode[];
    useTitle: () => string;
    useSubtitle?: () => string;
    useTrailingDecoration?: () => ReactNode;
    onClick?: () => void;
}

export interface StaticNode extends LayoutNode {
    type: LayoutType.STATIC;
    useTitle(): ReactNode | string;
    useSubtitle?(): ReactNode | string;
}

export interface ButtonNode extends LayoutNode {
    type: LayoutType.BUTTON;
    useTitle(): string;
    useLabel(): string;
    useSubtitle?(): string;
    useVariant?(): ButtonVariant;
    useDisabled?(): boolean;
    onClick(): void | Promise<any>;
}

export interface ToggleNode extends LayoutNode {
    type: LayoutType.TOGGLE;
    useTitle(): string;
    useSubtitle?(): string;
    useValue?(): boolean;
    setValue(value: boolean): void;
    useDisabled?(): boolean;
    /** Shows a HelpMessage with a WARN messageType only if {@link useDisabled} is true */
    useDisabledMessage?(): string;
    usePersistentBadge?(): string | boolean;
    /* Shows a little small icon in the switch. */
    hasIcon?: boolean;
    getDismissibleBadges?(): string[];
}

export interface SliderNode extends LayoutNode {
    type: LayoutType.SLIDER;
    setValue(value: number): void;
    getInitialValue?(): number;
    minValue?: number;
    maxValue?: number;
    useDefaultValue?(): number;
    useTitle(): string;
    useSubtitle?(): string;
    useHintText?(): string;
    useDisabled?(): boolean;
    useExternalValue?(): number;
    onValueRender?(value: number): ReactNode;
    asValueChanges?: boolean;
    markers?: number[];
    onMarkerRender?(marker: number): ReactNode;
    stickToMarkers?: boolean;
    usePersistentBadge?(): string | boolean;
    getDismissibleBadges?(): string[];
}

/**
 * Some props of Select components are used here
 * @see {@link Select} For more.
 */
export interface SelectNode extends LayoutNode {
    type: LayoutType.SELECT;
    useTitle(): string;
    useSubtitle?(): string;
    useValue?(): string | string[];
    setValue(value: string | string[]): void;
    useOptions?(): SelectOption[];
    clearable?: boolean;
    closeOnSelect?: boolean;
    wrapTags?: boolean;
    /**  @default "single" */
    selectionMode?: "single" | "multiple";
    usePersistentBadge?(): string | boolean;
    getDismissibleBadges?(): string[];
}

export interface RadioNode extends LayoutNode {
    type: LayoutType.RADIO;
    useTitle(): string;
    useValue(): PropertyKey;
    setValue(value: PropertyKey): void;
    useSubtitle?(): string;
    useOptions?(): Array<{
        value: any;
        name: string | ReactNode;
        desc?: string;
        disabled?: boolean;
        color?: string;
        icon?: ComponentType<any>;
        leadingIcon?: ComponentType<any>;
        radioItemIconClassName?: string;
        radioBarClassName?: string;
    }>;
    usePersistentBadge?(): string | boolean;
    getDismissibleBadges?(): string[];
}

export interface NavigatorNode extends LayoutNode {
    type: LayoutType.NAVIGATOR;
    destinationKey: UserSettingsKeys;
    /** @override When used, title will NOT use {@link destinationKey}'s title */
    useTitle?(): string;
    useSubtitle?(): string;
    useTrailingDecoration?(): JSX.Element | null;
}

export interface CustomNode extends LayoutNode {
    type: LayoutType.CUSTOM;
    Component(): ReactNode;
}

type InlineNoticeNode =
    | {
        /** If no type provided nothing renders. */
        type?: InlineNoticeType.TEXT;
        noticeType: "critical" | "warning" | "info" | "success";
        useText(): ReactNode | string;
        useTitle?(): ReactNode | string;
        /* Runs whenever the notice renders */
        trackView?(): void;
        /* onClick returns a promise. so it has "loading" set to true by default. */
        button?: {
            useText(): string;
            onClick(): void | Promise<any>;
        };
    }
    | {
        type: InlineNoticeType.STRONGLY_DISCOURAGED_CUSTOM;
        notice: ComponentType<any>;
    };

type DecorationNode = {
    component: ComponentType<any>;
    sticky?: boolean;
};

export type ContentNode =
    | CustomNode
    | StaticNode
    | ButtonNode
    | ToggleNode
    | SliderNode
    | SelectNode
    | RadioNode
    | NavigatorNode
    | CategoryNode
    | AccordionNode
    | ListNode
    | NestedPanelNode
    | RelatedNode
    | FieldSetNode
    | TabItemNode
    | SplitNode;
