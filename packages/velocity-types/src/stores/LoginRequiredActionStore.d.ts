import { FluxStore } from "..";

export class LoginRequiredActionStore extends FluxStore {
    /** Get required actions for a user */
    requiredActions(userId: string): string[] | null;

    /** Check if required actions include any of the specified actions */
    requiredActionsIncludes(userId: string, actions: string[]): boolean;

    /** Check if login was attempted for a user in this session */
    wasLoginAttemptedInSession(userId: string): boolean;

    /** Get current state */
    getState(): Record<string, string[] | null>;
}
