import { AppealEligibility, AppealStatusType, GuildMemberType, StandingState } from "../../../enums";
import { MessageAttachment } from "../messages";

export interface FlaggedContent {
    id: string;
    content: string;
    attachments: MessageAttachment[];
}

export interface ClassificationAction {
    id: string;
    descriptions: string[];
}

export interface GuildMetadata {
    name: string;
    member_type: GuildMemberType;
}

export interface AppealStatus {
    status: AppealStatusType;
}

export interface AccountStanding {
    state: StandingState;
}

export interface Classification {
    id: string;
    description: string;
    max_expiration_time: string;
    guild_metadata: GuildMetadata | null;
    appeal_status: AppealStatus | null;
    flagged_content: FlaggedContent[];
    explainer_link: string | null;
    is_coppa: boolean;
    actions: ClassificationAction[];
}

export interface SafetyHubFetchPayload {
    type: "SAFETY_HUB_FETCH_SUCCESS";
    classifications: Classification[];
    accountStanding: AccountStanding;
    isDsaEligible: boolean;
    isAppealEligible: boolean;
    username: string;
    appealEligibility: AppealEligibility[];
}
