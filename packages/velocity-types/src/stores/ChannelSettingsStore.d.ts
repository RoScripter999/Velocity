import { FluxStore, Channel } from "..";

export namespace ChannelSettingsStore {
    export interface FormState {
        submitting: boolean;
        errors: Record<string, string>;
        channel: Channel | null;
        section: string | null;
        subsection: string | null;
        invites: Record<string, any>;
        selectedOverwriteId: string | null;
        hasChanges: boolean;
        analyticsLocation: string | null;
    }

    export interface InvitesState {
        invites: Record<string, any>;
        loading: boolean;
    }
}

export class ChannelSettingsStore extends FluxStore {
    /** Check if there are unsaved changes */
    hasChanges(): boolean;

    /** Check if settings modal is open */
    isOpen(): boolean;

    /** Get current settings section */
    getSection(): string | null;

    /** Get invites and loading state */
    getInvites(): ChannelSettingsStore.InvitesState;

    /** Check if notice should be shown */
    showNotice(): boolean;

    /** Get the channel being edited */
    getChannel(): Channel | null;

    /** Get form submission state */
    getFormState(): string;

    /** Get parent category of the channel */
    getCategory(): Channel | null;

    /** Get all form props */
    getProps(): ChannelSettingsStore.FormState;
}
