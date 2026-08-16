import { FluxStore } from "..";

export interface Session {
    id_hash: string;
    approx_last_used_time: Date;
    client_info: {
        os: string;
        platform: string;
        location: string;
    };
    [key: string]: any;
}

export class AuthSessionsStore extends FluxStore {
    getSessions(): Session[];
}
