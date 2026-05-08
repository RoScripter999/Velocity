import { FluxStore } from "..";

export namespace QuestStore {
    export interface Quest {
        id: string;
        config: {
            expiresAt?: string | null;
            application: {
                id: string;
                name: string;
            };
            taskConfig?: any;
            taskConfigV2?: any;
            configVersion?: number;
            messages?: {
                questName?: string;
            };
            rewardsConfig: {
                platforms: string[];
                [key: string]: any;
            };
            [key: string]: any;
        };
        userStatus?: {
            questId: string;
            enrolledAt?: string;
            claimedAt?: string;
            completedAt?: string;
            progress: Record<string, any>;
            streamProgressSeconds?: number;
        };
        targetedContent: string[];
    }

    export interface ExcludedQuest {
        id: string;
    }

    export interface ClaimedQuest {
        id: string;
    }

    export interface QuestAdDecision {
        questId: string | null;
        fetchedAt: number;
        ttlMillis: number;
        adSetId: string | null;
        adRequestId: string | null;
    }

    export interface StreamHeartbeatFailure {
        questId: string;
        streamKey: string;
        firstFailedAt: number;
    }

    export interface QuestHomeTakeoverConfig {
        takeover?: any;
    }
}

export class QuestStore extends FluxStore {
    get quests(): Map<string, QuestStore.Quest>;
    get excludedQuests(): Map<string, QuestStore.ExcludedQuest>;
    get claimedQuests(): Map<string, QuestStore.ClaimedQuest>;
    get isFetchingCurrentQuests(): boolean;
    get isFetchingClaimedQuests(): boolean;
    isFetchingQuestPreview(questId: string): boolean;
    get lastFetchedCurrentQuests(): number;
    get lastFetchedQuestToDeliver(): number;
    get isFetchingQuestToDeliver(): boolean;
    isFetchingQuestToDeliverByPlacement(placement: string): boolean;
    get questDeliveryOverride(): QuestStore.Quest | undefined;
    get questToDeliverForPlacement(): Map<string, any>;
    get questEnrollmentBlockedUntil(): Date | null;
    get questAdDecisionByPlacement(): Map<string, QuestStore.QuestAdDecision>;
    getFetchQuestPreviewError(questId: string): any;
    isEnrolling(questId: string): boolean;
    isClaimingReward(questId: string): boolean;
    isFetchingRewardCode(questId: string): boolean;
    isDismissingContent(questId: string): boolean;
    getRewardCode(questId: string): string | undefined;
    getRewards(questId: string): any[] | undefined;
    getStreamHeartbeatFailure(streamKey: string): QuestStore.StreamHeartbeatFailure | undefined;
    getQuest(questId: string): QuestStore.Quest | undefined;
    getQuestConfig(questId: string): any;
    get questConfigs(): Map<string, any>;
    isProgressingOnDesktop(questId: string): boolean;
    selectedTaskPlatform(questId: string): string | null;
    getOptimisticProgress(questId: string, taskEventName: string): any;
    getExpiredQuestsMap(): Map<string, boolean>;
    isQuestExpired(questId: string): boolean;
    getQuestLoadedViaPreview(questId: string): QuestStore.Quest | undefined;
    isFetchingQuestHomeTakeover(): boolean;
    getQuestHomeTakeoverConfig(): QuestStore.QuestHomeTakeoverConfig | null;
    getLastFetchedQuestHomeTakeover(): number | null;
    getFirstWishlistId(userId: string): string | undefined;
}
