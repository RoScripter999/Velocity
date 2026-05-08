import { FluxStore } from "..";

export class ActivityInviteEducationStore extends FluxStore {
    getState(): Record<string, boolean>;
    shouldShowEducation(key: string): boolean;
}
