import { FluxStore, User, Channel, Application } from "..";

export namespace ActivityInviteModalStore {
    export enum SearchResultType {
        USER = 1,
        TEXT_CHANNEL = 2,
        GROUP_DM = 3
    }

    export interface ActivityInviteSearchResult {
        type: SearchResultType;
        sent: boolean;
        status?: string;
        categoryName?: string;
        guildName?: string;
        data: {
            type: SearchResultType;
            record: User | Channel;
            score: number;
        };
    }

    export interface Activity {
        application_id?: string;
        [key: string]: any;
    }
}

export class ActivityInviteModalStore extends FluxStore {
    getActivity(): ActivityInviteModalStore.Activity | null;
    getQuery(): string;
    getResults(): ActivityInviteModalStore.ActivityInviteSearchResult[];
}
