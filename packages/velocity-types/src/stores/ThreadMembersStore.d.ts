import { FluxStore, Channel } from "..";

export namespace ThreadMembersStore {
    export interface ThreadMemberInfo {
        guildId: string;
        parentId: string;
        memberCount: number;
        memberIdsPreview: string[];
    }

    export interface State {
        [threadId: string]: ThreadMemberInfo;
    }
}

export class ThreadMembersStore extends FluxStore {
    /** Get member count for a thread */
    getMemberCount(threadId: string): number | null;

    /** Get preview of member IDs in a thread */
    getMemberIdsPreview(threadId: string): string[] | null;

    /** Get initial overlay state */
    getInitialOverlayState(): ThreadMembersStore.State;
}
