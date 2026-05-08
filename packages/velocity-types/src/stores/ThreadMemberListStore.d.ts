import { FluxStore } from "..";

export namespace ThreadMemberListStore {
    export interface UserSection {
        sectionId: string;
        usersById: Record<string, UserInfo>;
        userIds: string[];
    }

    export interface UserInfo {
        userId: string;
        displayName: string;
        canViewChannel: boolean;
    }

    export interface Sections {
        [sectionId: string]: UserSection;
    }
}

export class ThreadMemberListStore extends FluxStore {
    getMemberListVersion(threadId: string): number | undefined;
    getMemberListSections(threadId: string): ThreadMemberListStore.Sections | undefined;
    canUserViewChannel(threadId: string, sectionId: string, userId: string): boolean;
}
