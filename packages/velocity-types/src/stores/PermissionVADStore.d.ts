import { FluxStore } from "..";

export class PermissionVADStore extends FluxStore {
    shouldShowWarning(): boolean;
    canUseVoiceActivity(): boolean;
    canUseLatching(): boolean;
}
