import { FluxStore } from "..";

export enum InviteState {
    RESOLVING = 0,
    RESOLVED = 1,
    EXPIRED = 2,
    BANNED = 3,
    ACCEPTING = 4,
    ACCEPTED = 5,
    ERROR = 6,
    APP_OPENING = 7,
    APP_OPENED = 8,
    APP_NOT_OPENED = 9,
}

export namespace InviteStore {
    export interface Invite {
        code: string;
        state: InviteState;
        baseCode?: string;
        guild?: any;
        channel?: any;
        inviter?: any;
        approximate_member_count?: number | null;
        approximate_presence_count?: number | null;
        target_type?: number;
        target_user?: any;
        target_application?: any;
        expires_at?: string;
        friends_count?: number;
        is_contact?: boolean;
        guild_scheduled_event?: any;
        type?: number;
        flags?: number;
        is_nickname_changeable?: boolean;
        profile?: any;
        roles?: any[];
        new_member?: boolean;
    }
}

export class InviteStore extends FluxStore {
    getInvite(code: string): InviteStore.Invite | undefined;
    getInviteError(code: string): any | undefined;
    getInvites(): Map<string, InviteStore.Invite>;
    getInviteKeyForGuildId(guildId: string): string | undefined;
    getFriendMemberIds(code: string): string[] | undefined;
}
