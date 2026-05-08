import { FluxStore } from "..";

export namespace GuildVerificationStore {
    export interface VerificationCheck {
        notClaimed: boolean;
        notEmailVerified: boolean;
        notPhoneVerified: boolean;
        newAccount: boolean;
        newMember: boolean;
        canChat: boolean;
        accountDeadline?: Date;
        memberDeadline?: Date;
    }
}

export class GuildVerificationStore extends FluxStore {
    /** Get verification check for a guild */
    getCheck(guildId: string | null): GuildVerificationStore.VerificationCheck;

    /** Check if user can chat in a guild */
    canChatInGuild(guildId: string): boolean;
}
