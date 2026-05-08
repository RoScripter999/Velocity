import { FluxStore } from "..";

export namespace InstantInviteStore {
    export interface InviteTarget {
        targetType?: string;
        targetUserId?: string;
        targetApplicationId?: string;
    }

    export interface Invite {
        code: string;
        targetType?: string;
        targetUser?: any;
        targetApplication?: any;
        createdAt?: number;
        [key: string]: any;
    }
}

export class InstantInviteStore extends FluxStore {
    /** Get an invite for a channel with optional target specification */
    getInvite(channelId: string, target?: InstantInviteStore.InviteTarget): InstantInviteStore.Invite | undefined;

    /** Get the current friend invite */
    getFriendInvite(): InstantInviteStore.Invite | null;

    /** Check if friend invites are being fetched */
    getFriendInvitesFetching(): boolean;

    /** Check if friend invite can be revoked */
    canRevokeFriendInvite(): boolean;
}
