import { FluxStore, Message } from "..";

export namespace MessageStore {
    interface EdgeCache {
        _messages: Message[];
        _map: Record<string, Message>;
        _wasAtEdge: boolean;
        _isCacheBefore: boolean;
    }

    interface MessageCollection {
        channelId: string;
        ready: boolean;
        cached: boolean;
        jumpType: string;
        jumpTargetId: string | null;
        jumpTargetOffset: number;
        jumpSequenceId: number;
        jumped: boolean;
        jumpedToPresent: boolean;
        jumpFlash: boolean;
        jumpReturnTargetId: string | null;
        focusTargetId: string | null;
        focusSequenceId: number;
        initialScrollSequenceId: number;
        suppressRowAnimationSequenceId: number;
        hasMoreBefore: boolean;
        hasMoreAfter: boolean;
        loadingMore: boolean;
        revealedMessageId: string | null;
        hasFetched: boolean;
        error: boolean;
        _array: Message[];
        _before: EdgeCache;
        _after: EdgeCache;
        _map: Record<string, Message>;

        get length(): number;
        toArray(): Message[];
        forEach(callback: (message: Message, index: number) => void, thisArg?: any, reverse?: boolean): void;
        reduce<T>(callback: (acc: T, message: Message) => T, initial: T): T;
        some(callback: (message: Message) => boolean, thisArg?: any): boolean;
        filter(callback: (message: Message) => boolean, thisArg?: any): Message[];
        forAll(callback: (message: Message) => void, thisArg?: any): void;
        findOldest(predicate: (message: Message) => boolean): Message | undefined;
        findNewest(predicate: (message: Message) => boolean): Message | undefined;
        map<T>(callback: (message: Message, index: number) => T, thisArg?: any): T[];
        first(): Message | undefined;
        last(): Message | undefined;
        get(id: string, checkCache?: false): Message;
        get(id: string, checkCache: true): Message | undefined;
        getByIndex(index: number): Message | undefined;
        getAfter(id: string): Message | null;
        getManyAfter(id: string, count: number, predicate?: (message: Message) => boolean): Message[] | null;
        getManyBefore(id: string, count: number, predicate?: (message: Message) => boolean): Message[] | null;
        hasAnyAfter(id: string, predicate: (message: Message) => boolean, limit?: number): boolean;
        has(id: string, checkCache?: boolean): boolean;
        indexOf(id: string): number;
        hasPresent(): boolean;
        hasBeforeCached(id: string): boolean;
        hasAfterCached(id: string): boolean;
        update(id: string, updater: (message: Message) => Message): MessageCollection;
        replace(oldId: string, newMessage: Message): MessageCollection;
        remove(id: string): MessageCollection;
        removeMany(ids: string[]): MessageCollection;
        merge(messages: Message[], before?: boolean, clearCache?: boolean): MessageCollection;
        mergeDelta(added?: Message[], updated?: Message[], removedIds?: string[]): MessageCollection;
        reset(messages: Message[]): MessageCollection;
        truncateTop(count: number, clone?: boolean): MessageCollection;
        truncateBottom(count: number, clone?: boolean): MessageCollection;
        jumpToPresent(count: number): MessageCollection;
        jumpToMessage(id: string, flash?: boolean, offset?: number, returnId?: string | null, jumpType?: string): MessageCollection;
        focusOnMessage(id: string): MessageCollection;
        loadFromCache(before: boolean, count: number): MessageCollection;
        truncate(before: boolean, after: boolean): MessageCollection;
        receiveMessage(message: Message, truncate?: boolean): MessageCollection;
        loadComplete(options: {
            newMessages: Message[];
            isBefore?: boolean;
            isAfter?: boolean;
            jump?: { messageId?: string; offset?: number; present?: boolean; flash?: boolean; jumpType?: string; returnMessageId?: string | null; } | null;
            hasMoreBefore?: boolean;
            hasMoreAfter?: boolean;
            avoidInitialScroll?: boolean;
            cached?: boolean;
            hasFetched?: boolean;
        }): MessageCollection;
    }
}

export class MessageStore extends FluxStore {
    getMessage(channelId: string, messageId: string): Message;
    getMessages(channelId: string): MessageStore.MessageCollection;
    getRawMessages(channelId: string): Record<string | number, any>;
    getLastEditableMessage(channelId: string): Message | undefined;
    getLastChatCommandMessage(channelId: string): Message | undefined;
    getLastMessage(channelId: string): Message | undefined;
    getLastNonCurrentUserMessage(channelId: string): Message | undefined;
    hasCurrentUserSentMessage(channelId: string): boolean;
    hasCurrentUserSentMessageSinceAppStart(): boolean;
    hasPresent(channelId: string): boolean;
    isReady(channelId: string): boolean;
    isLoadingMessages(channelId: string): boolean;
    jumpedMessageId(channelId: string): string | undefined;
    focusedMessageId(channelId: string): string | undefined;
    whenReady(channelId: string, callback: () => void): void;
}
