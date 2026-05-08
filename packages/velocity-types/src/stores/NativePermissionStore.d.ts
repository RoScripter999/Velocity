import { FluxStore } from "..";

export namespace NativePermissionStore {
    export interface State {
        permissionStates: Record<string, string>;
    }
}

export class NativePermissionStore extends FluxStore {
    /** Get user agnostic state */
    getUserAgnosticState(): NativePermissionStore.State;

    /** Check if user has granted a permission */
    hasPermission(permissionType: string): boolean;
}
