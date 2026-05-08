import { FluxStore } from "..";

export class HookErrorStore extends FluxStore {
    /** Get error for a specific hook type */
    getHookError(hookType: string): { errorMessage: string; errorCode: string; } | undefined;
}
