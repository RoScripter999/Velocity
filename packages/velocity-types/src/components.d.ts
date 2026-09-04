import type { ComponentClass, ComponentPropsWithRef, ComponentType, CSSProperties, ElementType, FC, HTMLAttributes, HTMLElementType, JSX, PropsWithChildren, ReactNode, Ref, SVGProps } from "react";
import type { FieldProps, Status } from "../";

// copy(find(m => Array.isArray(m) && m.includes("heading-sm/normal")).map(JSON.stringify).join("|"))
export type TextVariant = "heading-sm/normal" | "heading-sm/medium" | "heading-sm/semibold" | "heading-sm/bold" | "heading-sm/extrabold" | "heading-md/normal" | "heading-md/medium" | "heading-md/semibold" | "heading-md/bold" | "heading-md/extrabold" | "heading-lg/normal" | "heading-lg/medium" | "heading-lg/semibold" | "heading-lg/bold" | "heading-lg/extrabold" | "heading-xl/normal" | "heading-xl/medium" | "heading-xl/semibold" | "heading-xl/bold" | "heading-xl/extrabold" | "heading-xxl/normal" | "heading-xxl/medium" | "heading-xxl/semibold" | "heading-xxl/bold" | "heading-xxl/extrabold" | "eyebrow" | "heading-deprecated-12/normal" | "heading-deprecated-12/medium" | "heading-deprecated-12/semibold" | "heading-deprecated-12/bold" | "heading-deprecated-12/extrabold" | "redesign/heading-18/bold" | "text-xxs/normal" | "text-xxs/medium" | "text-xxs/semibold" | "text-xxs/bold" | "text-xs/normal" | "text-xs/medium" | "text-xs/semibold" | "text-xs/bold" | "text-sm/normal" | "text-sm/medium" | "text-sm/semibold" | "text-sm/bold" | "text-md/normal" | "text-md/medium" | "text-md/semibold" | "text-md/bold" | "text-lg/normal" | "text-lg/medium" | "text-lg/semibold" | "text-lg/bold" | "redesign/message-preview/normal" | "redesign/message-preview/medium" | "redesign/message-preview/semibold" | "redesign/message-preview/bold" | "redesign/channel-title/normal" | "redesign/channel-title/medium" | "redesign/channel-title/semibold" | "redesign/channel-title/bold" | "display-sm" | "display-md" | "display-lg" | "code";

// copy(Object.keys(Icons).map(i => `"${i}"`).join("|"));
export type IconNames = "AIcon" | "AccessibilityIcon" | "AchievementsIcon" | "ActivitiesIcon" | "ActivitiesPlusIcon" | "AirplayIcon" | "AnalyticsIcon" | "AngleBracketsIcon" | "AnnouncementsChatIcon" | "AnnouncementsIcon" | "AnnouncementsLockIcon" | "AnnouncementsSpoilerIcon" | "AnnouncementsWarningIcon" | "AppleBrandLightIcon" | "AppleNeutralIcon" | "AppsIcon" | "AppsLockIcon" | "AppsSpoilerIcon" | "AppsWarningIcon" | "ArrowAngleDownLeftIcon" | "ArrowAngleLeftDownIcon" | "ArrowAngleLeftUpIcon" | "ArrowAngleRightDownIcon" | "ArrowAngleRightUpIcon" | "ArrowAngleUpLeftIcon" | "ArrowLargeDownIcon" | "ArrowLargeLeftIcon" | "ArrowLargeRightIcon" | "ArrowLargeUpIcon" | "ArrowSmallDownIcon" | "ArrowSmallLeftIcon" | "ArrowSmallRightIcon" | "ArrowSmallUpIcon" | "ArrowsLeftRightIcon" | "ArrowsUpDownIcon" | "AsteriskIcon" | "AtIcon" | "AttachmentIcon" | "BIcon" | "BackspaceIcon" | "BadgeIcon" | "BankIcon" | "BattlenetBrandIcon" | "BattlenetNeutralIcon" | "BeakerIcon" | "BellIcon" | "BellSlashIcon" | "BellZIcon" | "BicycleIcon" | "BillIcon" | "BlueskyBrandIcon" | "BlueskyNeutralIcon" | "BluetoothIcon" | "BlurBackgroundIcon" | "BoldIcon" | "BookCheckIcon" | "BookIcon" | "BookmarkIcon" | "BookmarkOutlineIcon" | "BoostGemIcon" | "BoostGemOutlineIcon" | "BoostGemSlashIcon" | "BoostTier1Icon" | "BoostTier1SimpleIcon" | "BoostTier2Icon" | "BoostTier2SimpleIcon" | "BoostTier3Icon" | "BoostTier3SimpleIcon" | "BrowserCheckeredIcon" | "BrowserIcon" | "BrowserLinkIcon" | "BrowserPlusIcon" | "BrowserQuestionMarkIcon" | "BugIcon" | "BurgerIcon" | "CalendarIcon" | "CalendarMinusIcon" | "CalendarPlusIcon" | "CalendarRetryIcon" | "CalendarXIcon" | "CameraIcon" | "CameraSwapIcon" | "CandyIcon" | "CarIcon" | "ChannelListIcon" | "ChannelListMagnifyingGlassIcon" | "ChannelListMinusIcon" | "ChannelListPlusIcon" | "ChannelListRetryIcon" | "ChannelNotificationIcon" | "ChannelsFollowedIcon" | "ChatArrowRightIcon" | "ChatCheckIcon" | "ChatDotsIcon" | "ChatEyeIcon" | "ChatIcon" | "ChatMarkUnreadIcon" | "ChatMinusIcon" | "ChatNotificationIcon" | "ChatPlusIcon" | "ChatRetryIcon" | "ChatShieldIcon" | "ChatSlowModeIcon" | "ChatSmileIcon" | "ChatSpeakIcon" | "ChatWarningIcon" | "ChatXIcon" | "CheckmarkLargeBoldIcon" | "CheckmarkLargeIcon" | "CheckmarkSmallBoldIcon" | "CheckmarkSmallIcon" | "ChevronLargeDownIcon" | "ChevronLargeLeftIcon" | "ChevronLargeRightIcon" | "ChevronLargeUpIcon" | "ChevronSmallDownIcon" | "ChevronSmallLeftIcon" | "ChevronSmallRightIcon" | "ChevronSmallUpIcon" | "CircleCheckIcon" | "CircleErrorIcon" | "CircleInformationIcon" | "CircleMinusIcon" | "CirclePlayIcon" | "CirclePlusIcon" | "CircleQuestionIcon" | "CircleXIcon" | "ClapperboardIcon" | "ClipboardCheckIcon" | "ClipboardListIcon" | "ClipsAutoIcon" | "ClipsGalleryIcon" | "ClipsIcon" | "ClockIcon" | "ClockWarningIcon" | "ClockXIcon" | "ClosedCaptionsIcon" | "ClosedCaptionsOutlineIcon" | "CloudDownloadIcon" | "CloudIcon" | "CloudUploadIcon" | "ClydeIcon" | "CollapseListIcon" | "CollectionIcon" | "CompassIcon" | "ConnectionAverageIcon" | "ConnectionBadIcon" | "ConnectionFineIcon" | "ConnectionUnknownIcon" | "ContactsIcon" | "CopyIcon" | "CreditCardIcon" | "CropIcon" | "CrownIcon" | "CrunchyrollBrandLightIcon" | "CrunchyrollNeutralIcon" | "DenyIcon" | "DiceIcon" | "DoorEnterIcon" | "DoorExitIcon" | "DoubleCheckmarkIcon" | "DoubleChevronSmallLeftIcon" | "DoubleChevronSmallRightIcon" | "DownloadIcon" | "DpadIcon" | "DragIcon" | "DyingRoseIcon" | "EducationIcon" | "EmbedIcon" | "EmoIcon" | "EmojiAngryFaceWithHornsIcon" | "EmojiAnguishedFaceIcon" | "EmojiAstonishedFaceIcon" | "EmojiBlaseFaceIcon" | "EmojiColdFaceIcon" | "EmojiConfoundedFaceIcon" | "EmojiConfusedFaceIcon" | "EmojiCowboyHatFaceIcon" | "EmojiCryingFaceIcon" | "EmojiDeadpanFaceIcon" | "EmojiDisappointedFaceIcon" | "EmojiDisguisedFaceIcon" | "EmojiDottedLineFaceIcon" | "EmojiElatedFaceIcon" | "EmojiEnragedFaceIcon" | "EmojiExpressionlessFaceIcon" | "EmojiFaceBlowingAKissIcon" | "EmojiFaceSavoringFoodIcon" | "EmojiFaceVomitingIcon" | "EmojiFaceWithCrossedOutEyesIcon" | "EmojiFaceWithDiagonalMouthIcon" | "EmojiFaceWithHeadBandageIcon" | "EmojiFaceWithMedicalMaskIcon" | "EmojiFaceWithMonocleIcon" | "EmojiFaceWithOpenMouthIcon" | "EmojiFaceWithRaisedEyebrowIcon" | "EmojiFaceWithSpiralEyesIcon" | "EmojiFaceWithTearsOfJoyIcon" | "EmojiFaceWithTongueIcon" | "EmojiFaceWithoutMouthIcon" | "EmojiFrowningFaceIcon" | "EmojiFrowningFaceWithOpenMouthIcon" | "EmojiGrimacingFaceIcon" | "EmojiGrinningFaceIcon" | "EmojiGrinningFaceWithBigEyesIcon" | "EmojiGrinningFaceWithSmilingEyesIcon" | "EmojiGrinningFaceWithSweatIcon" | "EmojiGrumpyFaceIcon" | "EmojiHappyWinkingFaceIcon" | "EmojiHotFaceIcon" | "EmojiJokingFaceIcon" | "EmojiKissingFaceIcon" | "EmojiKissingFaceWithClosedEyesIcon" | "EmojiMeltingFaceIcon" | "EmojiMoneyMouthFaceIcon" | "EmojiNauseatedFaceIcon" | "EmojiNerdFaceIcon" | "EmojiNeutralFaceIcon" | "EmojiPartyingFaceIcon" | "EmojiPeopleIcon" | "EmojiPerseveringFaceIcon" | "EmojiRelievedFaceIcon" | "EmojiRollingOnTheFloorLaughingIcon" | "EmojiSadFaceWithCrossedOutEyesIcon" | "EmojiSalutingFaceIcon" | "EmojiSkullIcon" | "EmojiSleepingFaceIcon" | "EmojiSlightlyFrowningFaceIcon" | "EmojiSlightlySmilingFaceIcon" | "EmojiSmilingFaceWithHaloIcon" | "EmojiSmilingFaceWithHeartsIcon" | "EmojiSmilingFaceWithHornsIcon" | "EmojiSmilingFaceWithSmilingEyesIcon" | "EmojiSmilingFaceWithSunglassesIcon" | "EmojiSmilingFaceWithTearIcon" | "EmojiSmirkingFaceIcon" | "EmojiSneezingFaceIcon" | "EmojiSquintingFaceWithTongueIcon" | "EmojiTiredFaceIcon" | "EmojiUnamusedFaceIcon" | "EmojiUpsideDownFaceIcon" | "EmojiWearyFaceIcon" | "EmojiWinkingFaceIcon" | "EmojiWinkingFaceWithTongueIcon" | "EmojiWoozyFaceIcon" | "EmojiWorriedFaceIcon" | "EmojiZanyFaceIcon" | "EnvelopeIcon" | "EpicGamesBrandDarkIcon" | "EpicGamesNeutralIcon" | "ExpandGifIcon" | "ExperimentalCheckpointIcon" | "ExperimentalCommonIcon" | "ExperimentalConfettiIcon" | "ExperimentalCouchIcon" | "ExperimentalCreateEmojiIcon" | "ExperimentalEpicIcon" | "ExperimentalGameControllerLinkIcon" | "ExperimentalLfgIcon" | "ExperimentalLfgLockIcon" | "ExperimentalLootboxIcon" | "ExperimentalMicrophoneSparkleIcon" | "ExperimentalMicrophoneSparkleMutedIcon" | "ExperimentalMicrophoneSpeakingIcon" | "ExperimentalMythicIcon" | "ExperimentalPineappleHouseIcon" | "ExperimentalRareIcon" | "ExperimentalSnowflakeIcon" | "EyeDropperIcon" | "EyeIcon" | "EyePlusIcon" | "EyeSlashIcon" | "FacebookNeutralIcon" | "FileDenyIcon" | "FileIcon" | "FileUpIcon" | "FileWarningIcon" | "FilterIcon" | "FiltersHorizontalIcon" | "FireIcon" | "FlagIcon" | "FlagMinusIcon" | "FlagPlusIcon" | "FlagRetryIcon" | "FlashIcon" | "FlipHorizontalIcon" | "FlipVerticalIcon" | "FolderIcon" | "FolderPlusIcon" | "FoodIcon" | "ForumIcon" | "ForumLockIcon" | "ForumSpoilerIcon" | "ForumWarningIcon" | "FriendsIcon" | "FullscreenEnterIcon" | "FullscreenExitIcon" | "GameControllerIcon" | "GifIcon" | "GiftIcon" | "GlobeEarthIcon" | "GoogleNeutralIcon" | "GooglePlayBrandIcon" | "GooglePlayNeutralIcon" | "GridHorizontalIcon" | "GridSquareIcon" | "GridVerticalIcon" | "GroupArrowDownIcon" | "GroupArrowRightIcon" | "GroupIcon" | "GroupMinusIcon" | "GroupPlusIcon" | "GroupRetryIcon" | "HammerIcon" | "HammerMinusIcon" | "HammerPlusIcon" | "HammerRetryIcon" | "HammerXIcon" | "HandRequestDenyIcon" | "HandRequestSpeakIcon" | "HandRequestSpeakListIcon" | "HashmarkIcon" | "HdIcon" | "HeadphonesDenyIcon" | "HeadphonesIcon" | "HeadphonesSlashIcon" | "HeartIcon" | "HeartOutlineIcon" | "HomeIcon" | "HomeSlashIcon" | "HourglassIcon" | "HubIcon" | "IdCardIcon" | "IdIcon" | "ImageBrokenIcon" | "ImageFileIcon" | "ImageFileUpIcon" | "ImageIcon" | "ImageLockIcon" | "ImagePlusIcon" | "ImageSparkleIcon" | "ImageTextIcon" | "ImageWarningIcon" | "ImagesIcon" | "InboxIcon" | "InstagramNeutralIcon" | "InventoryIcon" | "ItalicIcon" | "JoystickIcon" | "KeyIcon" | "KeyboardIcon" | "LanguageIcon" | "LaptopIcon" | "LaptopPhoneIcon" | "LeagueOfLegendsBrandIcon" | "LettersIcon" | "LightbulbIcon" | "LinkExternalMediumIcon" | "LinkExternalSmallIcon" | "LinkIcon" | "LinkPlusIcon" | "LinkshellIcon" | "ListBulletsIcon" | "ListNumberedIcon" | "ListViewIcon" | "LocationIcon" | "LockIcon" | "LockUnlockedIcon" | "MagicDoorIcon" | "MagicWandIcon" | "MagnifyingGlassIcon" | "MagnifyingGlassMinusIcon" | "MagnifyingGlassPlusIcon" | "ManaIcon" | "MastodonBrandIcon" | "MastodonNeutralIcon" | "MaximizeIcon" | "MedalIcon" | "MenuIcon" | "MicrophoneArrowRightIcon" | "MicrophoneDenyIcon" | "MicrophoneIcon" | "MicrophoneSlashIcon" | "MicrophoneWarningIcon" | "MinecraftBrandIcon" | "MinecraftNeutralIcon" | "MinimizeIcon" | "MinusIcon" | "MobilePhoneControllerIcon" | "MobilePhoneIcon" | "MobilePhonePlusIcon" | "MobilePhoneSettingsIcon" | "MobilePhoneShareIcon" | "MobilePhoneSpeakerIcon" | "MobilePhoneVideoIcon" | "MobilePhoneXIcon" | "ModerationIcon" | "MoreHorizontalIcon" | "MoreVerticalIcon" | "MusicIcon" | "MusicSlashIcon" | "NatureIcon" | "NearbyScanIcon" | "NewUserIcon" | "NewUserSimpleIcon" | "NintendoSwitchNeutralIcon" | "NitroWheelIcon" | "ObjectIcon" | "OrbsIcon" | "PaintPaletteIcon" | "PaintbrushThickIcon" | "PaintbrushThickMinusIcon" | "PaintbrushThickPlusIcon" | "PaintbrushThickRetryIcon" | "PaintbrushThinIcon" | "PaintbrushThinMinusIcon" | "PaintbrushThinPlusIcon" | "PaintbrushThinRetryIcon" | "PanelClosedIcon" | "PanelOpenIcon" | "PaperClockIcon" | "PaperIcon" | "PaperLockIcon" | "PaperPlusIcon" | "PauseIcon" | "PawPrintIcon" | "PaymentTypeAmericanExpressIcon" | "PaymentTypeApplePayIcon" | "PaymentTypeAthIcon" | "PaymentTypeBancontactIcon" | "PaymentTypeBcCardIcon" | "PaymentTypeBoletoIcon" | "PaymentTypeCartesBancairesIcon" | "PaymentTypeCashAppIcon" | "PaymentTypeDinaCardIcon" | "PaymentTypeDinersClubIcon" | "PaymentTypeDiscoverIcon" | "PaymentTypeEloCardBrIcon" | "PaymentTypeEpsUberweisungIcon" | "PaymentTypeGCashIcon" | "PaymentTypeGiftCardIcon" | "PaymentTypeGiropayIcon" | "PaymentTypeGoPayIcon" | "PaymentTypeGooglePayIcon" | "PaymentTypeGrabPayIcon" | "PaymentTypeHipercardIcon" | "PaymentTypeIDealWeroIcon" | "PaymentTypeInteracIcon" | "PaymentTypeJcbIcon" | "PaymentTypeKakaoPayIcon" | "PaymentTypeKlarnaIcon" | "PaymentTypeKookminBankIcon" | "PaymentTypeMaestroIcon" | "PaymentTypeMastercardIcon" | "PaymentTypeMoMoWalletIcon" | "PaymentTypeMultibancoIcon" | "PaymentTypePayPalIcon" | "PaymentTypePaysafeCardIcon" | "PaymentTypePixLogoIcon" | "PaymentTypePixLogotypeIcon" | "PaymentTypePrzelewy24Icon" | "PaymentTypeUnionPayIcon" | "PaymentTypeVenmoIcon" | "PaymentTypeVisaIcon" | "PencilIcon" | "PencilSparkleIcon" | "PhoneCallIcon" | "PhoneHangUpIcon" | "PhoneIcon" | "PiggyBankIcon" | "PinIcon" | "PinUprightIcon" | "PinUprightSlashIcon" | "PlaneIcon" | "PlaneTravelIcon" | "PlayIcon" | "PlaybackOffIcon" | "PlaybackOnIcon" | "PlaystationNeutralIcon" | "PlusLargeIcon" | "PlusMediumIcon" | "PlusSmallIcon" | "PollsIcon" | "PotionIcon" | "PrivacyAndSafetyIcon" | "PuzzlePieceIcon" | "PuzzlePieceMinusIcon" | "PuzzlePiecePlusIcon" | "PuzzlePieceRetryIcon" | "QrCodeIcon" | "QuestsArenaIcon" | "QuestsBountiesIcon" | "QuestsIcon" | "QuestsMissionsIcon" | "QuestsNotificationIcon" | "QuoteIcon" | "ReactionIcon" | "ReactionMinusIcon" | "ReactionPlusIcon" | "ReceiptIcon" | "RecordPlayerIcon" | "RedditNeutralIcon" | "RedoIcon" | "RefreshIcon" | "RemixIcon" | "RemoveReactionIcon" | "RetryIcon" | "RibbonIcon" | "RiotGamesBrandIcon" | "RiotGamesNeutralIcon" | "RobloxBrandDarkIcon" | "RobloxNeutralIcon" | "RobotIcon" | "RotateIcon" | "ScienceIcon" | "ScreenArrowIcon" | "ScreenIcon" | "ScreenSlashIcon" | "ScreenStreamIcon" | "ScreenSystemRequirementsIcon" | "ScreenXIcon" | "SendMessageIcon" | "ServerGridIcon" | "ServerIcon" | "SettingsArrowUpIcon" | "SettingsCircleIcon" | "SettingsIcon" | "SettingsInfoIcon" | "SettingsPlusIcon" | "ShareIcon" | "ShieldAtIcon" | "ShieldIcon" | "ShieldLockIcon" | "ShieldUserIcon" | "ShopCircleIcon" | "ShopIcon" | "ShopMinusIcon" | "ShopPlusIcon" | "ShopSparkleIcon" | "SignPostIcon" | "SkipBackwardIcon" | "SkipForwardIcon" | "SkullIcon" | "SlashBoxIcon" | "SlashIcon" | "SlashMinusIcon" | "SlashPlusIcon" | "SlashRetryIcon" | "SoundboardIcon" | "SoundboardSlashIcon" | "SparklesIcon" | "SpeedometerIcon" | "SpoilerIcon" | "SpotifyBrandIcon" | "SpotifyNeutralIcon" | "StaffBadgeIcon" | "StageIcon" | "StageListIcon" | "StageLockIcon" | "StageMinusIcon" | "StageModeratorIcon" | "StagePlusIcon" | "StageRetryIcon" | "StageXIcon" | "StampIcon" | "StampXIcon" | "StarIcon" | "StarOutlineIcon" | "StarShootingIcon" | "SteamBrandDarkIcon" | "SteamBrandLightIcon" | "SteamNeutralIcon" | "StickerDeadIcon" | "StickerIcon" | "StickerMinusIcon" | "StickerPlusIcon" | "StickerRetryIcon" | "StickerSadIcon" | "StickerSmallIcon" | "StickerWink1Icon" | "StickerWink2Icon" | "StopIcon" | "StrikethroughIcon" | "SubscriptionIcon" | "SuperReactionIcon" | "TagIcon" | "TagsIcon" | "TeacupIcon" | "TextControllerIcon" | "TextIcon" | "TextLockIcon" | "TextSpoilerIcon" | "TextUserIcon" | "TextWarningIcon" | "ThemeDarkIcon" | "ThemeGrayIcon" | "ThemeLightIcon" | "ThemeMidnightIcon" | "ThreadIcon" | "ThreadLockIcon" | "ThreadMinusIcon" | "ThreadPlusIcon" | "ThreadRetryIcon" | "ThreadWarningIcon" | "ThumbsDownIcon" | "ThumbsUpIcon" | "TicketIcon" | "TiktokNeutralIcon" | "TimerIcon" | "TopicsIcon" | "TrainIcon" | "TranscriptIcon" | "TranscriptOutlineIcon" | "TrashIcon" | "TreehouseIcon" | "TrophyIcon" | "TvIcon" | "TwitchNeutralIcon" | "TwitterNeutralIcon" | "UnderlineIcon" | "UndoIcon" | "UnknownGameIcon" | "UnsendIcon" | "UploadIcon" | "UserArrowDiagonalBottomRightIcon" | "UserCheckIcon" | "UserCircleIcon" | "UserCircleStatusIcon" | "UserClockIcon" | "UserIcon" | "UserMinusIcon" | "UserPlatformIcon" | "UserPlayIcon" | "UserPlusIcon" | "UserRetryIcon" | "UserSquareIcon" | "UserStatusIcon" | "UserWarningIcon" | "VeinIcon" | "VideoIcon" | "VideoLockIcon" | "VideoSelfieIcon" | "VideoSlashIcon" | "ViewReactionIcon" | "VoiceBluetoothIcon" | "VoiceLockIcon" | "VoiceLowIcon" | "VoiceNormalIcon" | "VoiceNormalSpoilerIcon" | "VoiceWarningIcon" | "VoiceXIcon" | "VrHeadsetIcon" | "WalletIcon" | "WarningIcon" | "WaveformIcon" | "WaveformSlashIcon" | "WebhookIcon" | "WebhookPlusIcon" | "WidgetsIcon" | "WidgetsMinusIcon" | "WidgetsPlusIcon" | "WidgetsRetryIcon" | "WindowLaunchIcon" | "WindowReturnIcon" | "WindowTopIcon" | "WindowTopOutlineIcon" | "WrenchIcon" | "XLargeBoldIcon" | "XLargeIcon" | "XNeutralIcon" | "XSmallBoldIcon" | "XSmallIcon" | "XXsmallBoldIcon" | "XXsmallIcon" | "XboxNeutralIcon" | "YoutubeNeutralIcon";

// copy([...new Set(Object.values(findByProps("colors", "unsafe_rawColors").colors).map(v => v.css))].map(v => `"${v}"`).join("|"))
export type RawCSSColor = "var(--app-frame-background)" | "var(--app-frame-border)" | "var(--app-message-embed-secondary-text)" | "var(--background-accent)" | "var(--background-base-low)" | "var(--background-base-lower)" | "var(--background-base-lowest)" | "var(--background-brand)" | "var(--background-code)" | "var(--background-code-addition)" | "var(--background-code-deletion)" | "var(--background-feedback-critical)" | "var(--background-feedback-info)" | "var(--background-feedback-notification)" | "var(--background-feedback-positive)" | "var(--background-feedback-warning)" | "var(--background-mod-muted)" | "var(--background-mod-normal)" | "var(--background-mod-strong)" | "var(--background-mod-subtle)" | "var(--background-scrim)" | "var(--background-scrim-lightbox)" | "var(--background-secondary-alt)" | "var(--background-surface-high)" | "var(--background-surface-higher)" | "var(--background-surface-highest)" | "var(--background-tile-gradient-pink-end)" | "var(--background-tile-gradient-pink-start)" | "var(--background-voice-muted)" | "var(--badge-background-brand)" | "var(--badge-background-default)" | "var(--badge-expressive-background-default)" | "var(--badge-expressive-text-default)" | "var(--badge-notification-background)" | "var(--badge-text-brand)" | "var(--badge-text-default)" | "var(--bg-surface-raised)" | "var(--black)" | "var(--border-feedback-critical)" | "var(--border-focus)" | "var(--border-muted)" | "var(--border-normal)" | "var(--border-strong)" | "var(--border-subtle)" | "var(--border-voice-muted)" | "var(--button-danger-background-disabled)" | "var(--button-outline-brand-background-hover)" | "var(--button-outline-brand-border-active)" | "var(--button-outline-primary-text)" | "var(--card-background-default)" | "var(--card-primary-pressed-bg)" | "var(--card-secondary-bg)" | "var(--card-secondary-pressed-bg)" | "var(--channel-background-default)" | "var(--channel-icon)" | "var(--channel-text-area-placeholder)" | "var(--channels-default)" | "var(--channeltextarea-background)" | "var(--chart-brand)" | "var(--chart-categorical-1)" | "var(--chart-categorical-10)" | "var(--chart-categorical-2)" | "var(--chart-categorical-3)" | "var(--chart-categorical-4)" | "var(--chart-categorical-5)" | "var(--chart-categorical-6)" | "var(--chart-categorical-7)" | "var(--chart-categorical-8)" | "var(--chart-categorical-9)" | "var(--chart-mono-1)" | "var(--chart-mono-2)" | "var(--chart-mono-3)" | "var(--chart-mono-4)" | "var(--chart-mono-5)" | "var(--chart-mono-6)" | "var(--chart-mono-7)" | "var(--chart-mono-text-1)" | "var(--chart-mono-text-2)" | "var(--chart-mono-text-3)" | "var(--chart-mono-text-4)" | "var(--chart-mono-text-5)" | "var(--chart-mono-text-6)" | "var(--chart-mono-text-7)" | "var(--chart-negative)" | "var(--chart-neutral)" | "var(--chart-positive)" | "var(--chat-background)" | "var(--chat-background-default)" | "var(--chat-border)" | "var(--chat-text-muted)" | "var(--checkbox-background-active)" | "var(--checkbox-background-default)" | "var(--checkbox-background-hover)" | "var(--checkbox-background-selected-default)" | "var(--checkbox-background-selected-hover)" | "var(--checkbox-border-active)" | "var(--checkbox-border-default)" | "var(--checkbox-border-hover)" | "var(--checkbox-border-selected-default)" | "var(--checkbox-border-selected-hover)" | "var(--checkbox-icon-active)" | "var(--chip-blurple-dark-background)" | "var(--chip-blurple-dark-text)" | "var(--chip-blurple-light-background)" | "var(--chip-blurple-light-text)" | "var(--chip-blurple-medium-background)" | "var(--chip-blurple-medium-text)" | "var(--chip-gray-dark-background)" | "var(--chip-gray-dark-text)" | "var(--chip-gray-light-background)" | "var(--chip-gray-light-text)" | "var(--chip-gray-medium-background)" | "var(--chip-gray-medium-text)" | "var(--chip-green-dark-background)" | "var(--chip-green-dark-text)" | "var(--chip-green-light-background)" | "var(--chip-green-light-text)" | "var(--chip-green-medium-background)" | "var(--chip-green-medium-text)" | "var(--chip-orange-dark-background)" | "var(--chip-orange-dark-text)" | "var(--chip-orange-light-background)" | "var(--chip-orange-light-text)" | "var(--chip-orange-medium-background)" | "var(--chip-orange-medium-text)" | "var(--chip-pink-dark-background)" | "var(--chip-pink-dark-text)" | "var(--chip-pink-light-background)" | "var(--chip-pink-light-text)" | "var(--chip-pink-medium-background)" | "var(--chip-pink-medium-text)" | "var(--chip-purple-dark-background)" | "var(--chip-purple-dark-text)" | "var(--chip-purple-light-background)" | "var(--chip-purple-light-text)" | "var(--chip-purple-medium-background)" | "var(--chip-purple-medium-text)" | "var(--chip-red-dark-background)" | "var(--chip-red-dark-text)" | "var(--chip-red-light-background)" | "var(--chip-red-light-text)" | "var(--chip-red-medium-background)" | "var(--chip-red-medium-text)" | "var(--chip-yellow-dark-background)" | "var(--chip-yellow-dark-text)" | "var(--chip-yellow-light-background)" | "var(--chip-yellow-light-text)" | "var(--chip-yellow-medium-background)" | "var(--chip-yellow-medium-text)" | "var(--collectibles-tab-gradient-center)" | "var(--collectibles-tab-gradient-inner)" | "var(--collectibles-tab-gradient-outer)" | "var(--content-inventory-media-seekbar-container)" | "var(--content-inventory-overlay-text-primary)" | "var(--content-inventory-overlay-text-secondary)" | "var(--context-menu-backdrop-background)" | "var(--control-brand-foreground)" | "var(--control-brand-foreground-new)" | "var(--control-connected-background-active)" | "var(--control-connected-background-default)" | "var(--control-connected-background-hover)" | "var(--control-connected-border-active)" | "var(--control-connected-border-default)" | "var(--control-connected-border-hover)" | "var(--control-connected-icon-active)" | "var(--control-connected-icon-default)" | "var(--control-connected-icon-hover)" | "var(--control-connected-text-active)" | "var(--control-connected-text-default)" | "var(--control-connected-text-hover)" | "var(--control-critical-primary-background-active)" | "var(--control-critical-primary-background-default)" | "var(--control-critical-primary-background-hover)" | "var(--control-critical-primary-border-active)" | "var(--control-critical-primary-border-default)" | "var(--control-critical-primary-border-hover)" | "var(--control-critical-primary-icon-active)" | "var(--control-critical-primary-icon-default)" | "var(--control-critical-primary-icon-hover)" | "var(--control-critical-primary-text-active)" | "var(--control-critical-primary-text-default)" | "var(--control-critical-primary-text-hover)" | "var(--control-critical-secondary-background-active)" | "var(--control-critical-secondary-background-default)" | "var(--control-critical-secondary-background-hover)" | "var(--control-critical-secondary-border-active)" | "var(--control-critical-secondary-border-default)" | "var(--control-critical-secondary-border-hover)" | "var(--control-critical-secondary-icon-active)" | "var(--control-critical-secondary-icon-default)" | "var(--control-critical-secondary-icon-hover)" | "var(--control-critical-secondary-text-active)" | "var(--control-critical-secondary-text-default)" | "var(--control-critical-secondary-text-hover)" | "var(--control-expressive-background-active)" | "var(--control-expressive-background-default)" | "var(--control-expressive-background-hover)" | "var(--control-expressive-border-active)" | "var(--control-expressive-border-default)" | "var(--control-expressive-border-hover)" | "var(--control-expressive-icon-active)" | "var(--control-expressive-icon-default)" | "var(--control-expressive-icon-hover)" | "var(--control-expressive-text-active)" | "var(--control-expressive-text-default)" | "var(--control-expressive-text-hover)" | "var(--control-icon-only-background-active)" | "var(--control-icon-only-background-hover)" | "var(--control-icon-only-border-active)" | "var(--control-icon-only-border-hover)" | "var(--control-icon-only-icon-active)" | "var(--control-icon-only-icon-default)" | "var(--control-icon-only-icon-hover)" | "var(--control-overlay-primary-background-active)" | "var(--control-overlay-primary-background-default)" | "var(--control-overlay-primary-background-hover)" | "var(--control-overlay-primary-border-active)" | "var(--control-overlay-primary-border-default)" | "var(--control-overlay-primary-border-hover)" | "var(--control-overlay-primary-icon-active)" | "var(--control-overlay-primary-icon-default)" | "var(--control-overlay-primary-icon-hover)" | "var(--control-overlay-primary-text-active)" | "var(--control-overlay-primary-text-default)" | "var(--control-overlay-primary-text-hover)" | "var(--control-overlay-secondary-background-active)" | "var(--control-overlay-secondary-background-default)" | "var(--control-overlay-secondary-background-hover)" | "var(--control-overlay-secondary-border-active)" | "var(--control-overlay-secondary-border-default)" | "var(--control-overlay-secondary-border-hover)" | "var(--control-overlay-secondary-icon-active)" | "var(--control-overlay-secondary-icon-default)" | "var(--control-overlay-secondary-icon-hover)" | "var(--control-overlay-secondary-text-active)" | "var(--control-overlay-secondary-text-default)" | "var(--control-overlay-secondary-text-hover)" | "var(--control-primary-background-active)" | "var(--control-primary-background-default)" | "var(--control-primary-background-hover)" | "var(--control-primary-border-active)" | "var(--control-primary-border-default)" | "var(--control-primary-border-hover)" | "var(--control-primary-icon-active)" | "var(--control-primary-icon-default)" | "var(--control-primary-icon-hover)" | "var(--control-primary-text-active)" | "var(--control-primary-text-default)" | "var(--control-primary-text-hover)" | "var(--control-secondary-background-active)" | "var(--control-secondary-background-default)" | "var(--control-secondary-background-hover)" | "var(--control-secondary-border-active)" | "var(--control-secondary-border-default)" | "var(--control-secondary-border-hover)" | "var(--control-secondary-icon-active)" | "var(--control-secondary-icon-default)" | "var(--control-secondary-icon-hover)" | "var(--control-secondary-text-active)" | "var(--control-secondary-text-default)" | "var(--control-secondary-text-hover)" | "var(--creator-revenue-icon-gradient-end)" | "var(--creator-revenue-icon-gradient-start)" | "var(--creator-revenue-info-box-background)" | "var(--creator-revenue-info-box-border)" | "var(--creator-revenue-locked-channel-icon)" | "var(--creator-revenue-progress-bar)" | "var(--datepicker-range-background-default)" | "var(--datepicker-range-background-hover)" | "var(--embed-background)" | "var(--embed-background-alternate)" | "var(--experimental-avatar-embed-bg)" | "var(--expressive-gradient-blue-end)" | "var(--expressive-gradient-blue-start)" | "var(--expressive-gradient-green-end)" | "var(--expressive-gradient-green-start)" | "var(--expressive-gradient-nitro-green-end)" | "var(--expressive-gradient-nitro-green-start)" | "var(--expressive-gradient-nitro-pink-end)" | "var(--expressive-gradient-nitro-pink-start)" | "var(--expressive-gradient-pink-end)" | "var(--expressive-gradient-pink-start)" | "var(--expressive-gradient-purple-end)" | "var(--expressive-gradient-purple-start)" | "var(--expressive-gradient-tenure-badge-bronze-end)" | "var(--expressive-gradient-tenure-badge-bronze-start)" | "var(--expressive-gradient-tenure-badge-diamond-end)" | "var(--expressive-gradient-tenure-badge-diamond-start)" | "var(--expressive-gradient-tenure-badge-emerald-end)" | "var(--expressive-gradient-tenure-badge-emerald-start)" | "var(--expressive-gradient-tenure-badge-gold-end)" | "var(--expressive-gradient-tenure-badge-gold-start)" | "var(--expressive-gradient-tenure-badge-opal-end)" | "var(--expressive-gradient-tenure-badge-opal-start)" | "var(--expressive-gradient-tenure-badge-platinum-end)" | "var(--expressive-gradient-tenure-badge-platinum-start)" | "var(--expressive-gradient-tenure-badge-ruby-end)" | "var(--expressive-gradient-tenure-badge-ruby-start)" | "var(--expressive-gradient-tenure-badge-silver-end)" | "var(--expressive-gradient-tenure-badge-silver-start)" | "var(--gradient-progress-pill-background)" | "var(--guild-profile-banner-background-default)" | "var(--home-background)" | "var(--icon-default)" | "var(--icon-feedback-critical)" | "var(--icon-feedback-info)" | "var(--icon-feedback-notification)" | "var(--icon-feedback-positive)" | "var(--icon-feedback-warning)" | "var(--icon-invert)" | "var(--icon-link)" | "var(--icon-muted)" | "var(--icon-overlay-dark)" | "var(--icon-overlay-light)" | "var(--icon-status-dnd)" | "var(--icon-status-idle)" | "var(--icon-status-offline)" | "var(--icon-status-online)" | "var(--icon-strong)" | "var(--icon-subtle)" | "var(--icon-transparent)" | "var(--icon-voice-connected)" | "var(--icon-voice-disconnected)" | "var(--icon-voice-muted)" | "var(--icon-voice-speaking)" | "var(--input-background-default)" | "var(--input-background-error-default)" | "var(--input-border-active)" | "var(--input-border-default)" | "var(--input-border-error-default)" | "var(--input-border-hover)" | "var(--input-border-readonly)" | "var(--input-icon-default)" | "var(--input-placeholder-text-default)" | "var(--input-text-default)" | "var(--input-text-error-default)" | "var(--interactive-accent-background-active)" | "var(--interactive-accent-background-default)" | "var(--interactive-accent-background-hover)" | "var(--interactive-accent-background-selected)" | "var(--interactive-background-active)" | "var(--interactive-background-hover)" | "var(--interactive-background-selected)" | "var(--interactive-icon-active)" | "var(--interactive-icon-default)" | "var(--interactive-icon-hover)" | "var(--interactive-muted)" | "var(--interactive-text-active)" | "var(--interactive-text-default)" | "var(--interactive-text-hover)" | "var(--logo-primary)" | "var(--mention-background)" | "var(--mention-foreground)" | "var(--message-automod-background-default)" | "var(--message-automod-background-hover)" | "var(--message-background-hover)" | "var(--message-highlight-background-default)" | "var(--message-highlight-background-hover)" | "var(--message-mentioned-background-default)" | "var(--message-mentioned-background-hover)" | "var(--mobile-background-scrim-opaque)" | "var(--mobile-expression-picker-background-default)" | "var(--mobile-guildbar-icon-default)" | "var(--mobile-text-heading-primary)" | "var(--modal-background)" | "var(--modal-footer-background)" | "var(--navigator-header-tint)" | "var(--nitro-tab-gradient-center)" | "var(--nitro-tab-gradient-inner-ring)" | "var(--nitro-tab-gradient-outer-ring)" | "var(--notice-background-critical)" | "var(--notice-background-info)" | "var(--notice-background-positive)" | "var(--notice-background-warning)" | "var(--notice-text-critical)" | "var(--notice-text-info)" | "var(--notice-text-positive)" | "var(--notice-text-warning)" | "var(--overlay-backdrop-lightbox)" | "var(--panel-bg)" | "var(--polls-normal-image-background)" | "var(--polls-victor-fill)" | "var(--polls-voted-fill)" | "var(--premium-nitro-pink-text)" | "var(--profile-gradient-note-background)" | "var(--profile-gradient-overlay)" | "var(--profile-gradient-overlay-synced-with-user-theme)" | "var(--profile-gradient-role-pill-background)" | "var(--profile-gradient-role-pill-border)" | "var(--profile-gradient-section-box)" | "var(--progressbar-indicator-background)" | "var(--progressbar-track-background)" | "var(--radio-background-active)" | "var(--radio-background-default)" | "var(--radio-background-hover)" | "var(--radio-background-selected-default)" | "var(--radio-background-selected-hover)" | "var(--radio-border-active)" | "var(--radio-border-default)" | "var(--radio-border-hover)" | "var(--radio-border-selected-default)" | "var(--radio-border-selected-hover)" | "var(--radio-foreground-active)" | "var(--radio-foreground-default)" | "var(--radio-foreground-hover)" | "var(--radio-thumb-background-active)" | "var(--reaction-background-active)" | "var(--reaction-background-default)" | "var(--reaction-background-hover)" | "var(--reaction-background-reacted-default)" | "var(--reaction-background-reacted-hover)" | "var(--reaction-border-active)" | "var(--reaction-border-default)" | "var(--reaction-border-hover)" | "var(--reaction-border-reacted-default)" | "var(--reaction-text-active)" | "var(--reaction-text-default)" | "var(--reaction-text-hover)" | "var(--reaction-text-reacted-default)" | "var(--redesign-button-premium-primary-pink-for-gradient)" | "var(--redesign-button-premium-primary-pressed-background)" | "var(--redesign-button-premium-primary-purple-for-gradient)" | "var(--redesign-button-premium-primary-purple-for-gradient-2)" | "var(--redesign-button-tertiary-background)" | "var(--redesign-button-tertiary-pressed-background)" | "var(--redesign-button-tertiary-pressed-text)" | "var(--redesign-button-tertiary-text)" | "var(--scrollbar-auto-scrollbar-color-thumb)" | "var(--scrollbar-auto-scrollbar-color-track)" | "var(--scrollbar-auto-thumb)" | "var(--scrollbar-auto-track)" | "var(--scrollbar-thin-thumb)" | "var(--scrollbar-thin-track)" | "var(--slider-track-background)" | "var(--spine-default)" | "var(--spoiler-hidden-background)" | "var(--spoiler-hidden-background-hover)" | "var(--spoiler-revealed-background)" | "var(--standard-tab-gradient-center)" | "var(--standard-tab-gradient-inner-ring)" | "var(--standard-tab-gradient-outer-ring)" | "var(--status-danger)" | "var(--status-online)" | "var(--status-positive)" | "var(--status-positive-background)" | "var(--status-positive-text)" | "var(--status-speaking)" | "var(--status-warning)" | "var(--status-warning-background)" | "var(--status-warning-text)" | "var(--steam-review-text-mixed)" | "var(--steam-review-text-negative)" | "var(--steam-review-text-positive)" | "var(--switch-background-active)" | "var(--switch-background-default)" | "var(--switch-background-hover)" | "var(--switch-background-selected-default)" | "var(--switch-background-selected-hover)" | "var(--switch-border-default)" | "var(--switch-border-hover)" | "var(--switch-border-selected-default)" | "var(--switch-border-selected-hover)" | "var(--switch-thumb-background-default)" | "var(--switch-thumb-background-selected-default)" | "var(--switch-thumb-icon-active)" | "var(--switch-thumb-icon-default)" | "var(--text-brand)" | "var(--text-code)" | "var(--text-code-addition)" | "var(--text-code-builtin)" | "var(--text-code-bullet)" | "var(--text-code-comment)" | "var(--text-code-deletion)" | "var(--text-code-keyword)" | "var(--text-code-section)" | "var(--text-code-string)" | "var(--text-code-tag)" | "var(--text-code-title)" | "var(--text-code-variable)" | "var(--text-default)" | "var(--text-feedback-critical)" | "var(--text-feedback-info)" | "var(--text-feedback-positive)" | "var(--text-feedback-warning)" | "var(--text-invert)" | "var(--text-link)" | "var(--text-muted)" | "var(--text-overlay-dark)" | "var(--text-overlay-light)" | "var(--text-status-dnd)" | "var(--text-status-idle)" | "var(--text-status-offline)" | "var(--text-status-online)" | "var(--text-strong)" | "var(--text-subtle)" | "var(--text-voice-connected)" | "var(--text-voice-disconnected)" | "var(--text-voice-speaking)" | "var(--textbox-markdown-syntax)" | "var(--thread-channel-spine)" | "var(--user-profile-activity-toolbar-background)" | "var(--user-profile-background-hover)" | "var(--user-profile-border)" | "var(--user-profile-note-background-focus)" | "var(--user-profile-overlay-background)" | "var(--user-profile-overlay-background-hover)" | "var(--user-profile-toolbar-background)" | "var(--user-profile-toolbar-border)" | "var(--white)";
export type CSSColorToken = RawCSSColor extends `var(--${infer T})` ? T : never;

export type TextProps<TagType extends ElementType = "div"> = PropsWithChildren<Omit<ComponentPropsWithRef<TagType>, "color"> & {
    variant?: TextVariant;
    /** Element type of the {@link Text}. @default "div" */
    tag?: TagType;
    /** Whether the text can be selected */
    selectable?: boolean;
    className?: string;
    /** Clamps the line of the text if too big */
    lineClamp?: number;
    /** Color of the text. @default text-default */
    color?: CSSColorToken | "currentColor" | "none" | "always-white";
    /** Useful for columns of numbers that need to align vertically. @default false */
    tabularNumbers?: boolean;
    /** Scales the text to the user setting font size. @default false */
    scaleFontToUserSetting?: boolean;
}>;

export type Text = <T extends ElementType = "div">(props: TextProps<T>) => ReactNode;

export type IconProps = SVGProps<SVGSVGElement> & {
    /**
     * @default "md"
     * @remarks Values — xxs: 12, xs: 16, sm: 18, md: 24, lg: 32, refresh_sm: 20
     */
    size?: "xxs" | "xs" | "sm" | "md" | "lg" | "refresh_sm" | "custom";
    width?: number;
    height?: number;
    /** @default "interactive-icon-default" */
    color?: "currentColor" | RawCSSColor | { css: string; };
    /** @ignore Unused by discord */
    colorClass?: string;
};

export type Icons = Record<IconNames, FC<IconProps>>;

export type CheckboxGroup = ComponentType<Omit<FieldProps, "role"> & {
    selectedValues: (string | number)[];
    onChange?(value: (string | number)[]): void;
    options: Array<{
        value: string | number;
        label: string;
        description?: string;
        disabled?: boolean;
        leadingIcon?: ComponentType<any>;
    }>;
}>;

export type LoadingIndicator = ComponentType<PropsWithChildren<{
    type?: "wanderingCubes" | "chasingDots" | "pulsingEllipsis" | "spinningCircle" | "spinningCircleSimple" | "lowMotion";
    animated?: boolean;
    className?: string;
    itemClassName?: string;
    "aria-label"?: string;
}>> & {
    Type: {
        WANDERING_CUBES: "wanderingCubes";
        CHASING_DOTS: "chasingDots";
        PULSING_ELLIPSIS: "pulsingEllipsis";
        SPINNING_CIRCLE: "spinningCircle";
        SPINNING_CIRCLE_SIMPLE: "spinningCircleSimple";
        LOW_MOTION: "lowMotion";
    };
};

export type FieldSet = ComponentType<PropsWithChildren<Omit<HTMLAttributes<HTMLFieldSetElement>, "label" | "description" | "children"> & {
    label?: ReactNode;
    description?: ReactNode;
}>>;

export type HelpMessage = ComponentType<{
    /** If not provided nothing renders. */
    messageType?: "warn" | "info" | "danger" | "positive" | "preview";
    children?: ReactNode;
    action?: ReactNode;
    className?: string;
    textColor?: CSSColorToken;
    textVariant?: TextVariant;
    icon?: ComponentType<{
        className?: string;
        color?: string;
    }>;
    /** Hides the {@link HelpMessage} component */
    hidden?: boolean;
}>;


export type HiddenVisually = ComponentType<PropsWithChildren<HTMLAttributes<HTMLElement> & {
    tag?: HTMLElementType;
    showOnFocus?: boolean;
    className?: string;
}>>;

export type Timestamp = ComponentType<PropsWithChildren<{
    timestamp: Date;
    isEdited?: boolean;

    className?: string;
    id?: string;

    cozyAlt?: boolean;
    compact?: boolean;
    isInline?: boolean;
    isVisibleOnlyOnHover?: boolean;
}>>;

export type Slider = ComponentClass<PropsWithChildren<FieldProps & {
    initialValue: number;
    defaultValue?: number;
    keyboardStep?: number;
    keyboardPageStep?: number;
    maxValue?: number;
    minValue?: number;
    markers?: number[];
    stickToMarkers?: boolean;
    equidistant?: boolean;

    value?: number;

    className?: string;
    consumeAxisOnly?: boolean;

    /** 0 above, 1 below */
    markerPosition?: 0 | 1;
    orientation?: "horizontal" | "vertical";

    getAriaValueText?(currentValue: number): string;
    renderMarker?(marker: number): ReactNode;
    onMarkerRender?(marker: number): ReactNode;
    onValueRender?(value: number): ReactNode;
    onValueChange?(value: number): void;
    asValueChanges?(value: number): void;

    handleSize?: number;
    mini?: boolean;
    hideBubble?: boolean;

    fillStyles?: CSSProperties;
    barStyles?: CSSProperties;
    grabberStyles?: CSSProperties;
    grabberClassName?: string;
    barClassName?: string;

    "aria-hidden"?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}>>;

export type Dialog = ComponentType<JSX.IntrinsicElements["div"]>;

type Resolve = (data: { theme: "light" | "dark", saturation: number; }) => {
    hex(): string;
    hsl(): string;
    int(): number;
    spring(): string;
};

export type useToken = (color: {
    css: string;
    resolve: Resolve;
}) => ReturnType<Resolve>;

export interface ScrollerBaseProps {
    className?: string;
    style?: CSSProperties;
    dir?: "ltr";
    paddingFix?: boolean;
    onClose?(): void;
    onScroll?(): void;
}

export type ScrollerThin = ComponentType<PropsWithChildren<ScrollerBaseProps & {
    orientation?: "horizontal" | "vertical" | "auto";
    fade?: boolean;
}>>;

interface BaseListItem {
    anchorId: any;
    listIndex: number;
    offsetTop: number;
    section: number;
}
interface ListSection extends BaseListItem {
    type: "section";
}
interface ListRow extends BaseListItem {
    type: "row";
    row: number;
    rowIndex: number;
}

export type ListScrollerThin = ComponentType<ScrollerBaseProps & {
    sections: number[];
    renderSection?: (item: ListSection) => ReactNode;
    renderRow: (item: ListRow) => ReactNode;
    renderFooter?: (item: any) => ReactNode;
    renderSidebar?: (listVisible: boolean, sidebarVisible: boolean) => ReactNode;
    wrapSection?: (section: number, children: ReactNode) => ReactNode;

    sectionHeight: number;
    rowHeight: number;
    footerHeight?: number;
    sidebarHeight?: number;

    chunkSize?: number;

    paddingTop?: number;
    paddingBottom?: number;
    fade?: boolean;
    onResize?: Function;
    getAnchorId?: any;

    innerTag?: string;
    innerId?: string;
    innerClassName?: string;
    innerRole?: string;
    innerAriaLabel?: string;
    // Yes, Discord uses this casing
    innerAriaMultiselectable?: boolean;
    innerAriaOrientation?: "vertical" | "horizontal";
}>;

export type Clickable = <T extends "a" | "div" | "span" | "li" = "div">(props: PropsWithChildren<ComponentPropsWithRef<T>> & {
    tag?: T;
}) => ReactNode;

export type Avatar = ComponentType<PropsWithChildren<{
    className?: string;
    imageClassName?: string;

    src?: string;
    avatarDecoration?: string;
    size: "SIZE_16" | "SIZE_20" | "SIZE_24" | "SIZE_32" | "SIZE_40" | "SIZE_48" | "SIZE_56" | "SIZE_80" | "SIZE_120";

    status?: Status;

    /** Changes the color of {@link status} value */
    statusColor?: string;
    statusTooltip?: string | boolean;
    statusBackdropColor?: string;
    statusTooltipDelay?: number;

    typingOffset?: number;

    isMobile?: boolean;
    isTyping?: boolean;
    isSpeaking?: boolean;
    isVR?: boolean;

    specs?: {
        offset: number;
        size: number;
        status: number;
        stroke: number;
    };

    typingIndicatorRef?: unknown;

    "aria-hidden"?: boolean;
    "aria-label"?: string;
}>>;

export type FocusLock = ComponentType<PropsWithChildren<{
    containerRef: Ref<HTMLElement>;
}>>;

export type ColorPicker = ComponentType<{
    color: number | null;
    showEyeDropper?: boolean;
    suggestedColors?: string[];
    label?: ReactNode;
    onChange(value: number | null): void;
}>;

export type TagGroup = ComponentType<{
    listRef?: Ref<any>;
    /**
     * Shorthand for ariaLabel.
     * Will spam warnings about "An aria-label or aria-labelledby prop is required for accessibility." if not provided.
     */
    label?: string;
    disabledKeys?: string[];
    /** Selection mode of the {@link items}. @default none */
    selectionMode?: "none" | "single" | "multiple";
    layout?: "default" | "inline";
    items: Array<{
        id: string | number;
        label: string;
        accessibilityHint?: string;
        icon?: ComponentType<any> | { type: "role"; color: string; } | { type: "avatar"; src: string; } | { type: "image"; src: string; };
    }>;
    onRemove?(keys: Set<string>): void;
    children?: ReactNode;
    selectedKeys?: Set<string>;
    onSelectionChange?(keys: Set<string>): void;
    /** @default true */
    removable?: boolean;
    inInput?: boolean;
}>;
