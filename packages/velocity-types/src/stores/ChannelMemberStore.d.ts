import { FluxStore } from "..";


export namespace ChannelMemberStore {
    export interface Group {
        type: "GROUP";
        key: string;
        id: string;
        title: string;
        count: number;
        index: number;
    }

    export interface Member {
        type: "MEMBER";
        user: any;
        status: string;
        activities: any[];
        applicationStream?: any;
        isOwner: boolean;
        isMobileOnline: boolean;
        nick?: string | null;
        roles?: string[];
        joinedAt?: string;
        premiumSince?: string | null;
        deaf?: boolean;
        mute?: boolean;
    }

    export type Row = Group | Member;

    export interface Props {
        listId: string;
        groups: Group[];
        rows: Row[];
        version: number;
    }
}

export class ChannelMemberStore extends FluxStore {
    getProps(guildId: string, channelId: string): ChannelMemberStore.Props;
    getRows(guildId: string, channelId: string): ChannelMemberStore.Row[];
}
