import { FluxStore } from "..";

export namespace ApplicationCommandStore {
    export interface CommandOption {
        name: string;
        description: string;
        type: number;
        [key: string]: any;
    }

    export interface ApplicationCommand {
        id: string;
        name: string;
        description: string;
        options?: CommandOption[];
        [key: string]: any;
    }

    export interface CommandSection {
        id: string;
        name: string;
        [key: string]: any;
    }

    export interface OptionState {
        isActive: boolean;
        hasValue: boolean;
        lastValidationResult?: any;
        optionValue?: any;
        location?: number;
        length?: number;
    }

    export interface State {
        activeCommand: ApplicationCommand | null;
        activeCommandSection: CommandSection | null;
        activeOptionName: string | null;
        preferredCommandId: string | null;
        optionStates: Record<string, OptionState>;
        initialValues: Record<string, any>;
        commandOrigin: string | null;
        source?: string;
    }

    export interface ChangedOptionStates {
        [optionName: string]: Partial<OptionState>;
    }
}

export class ApplicationCommandStore extends FluxStore {
    getActiveCommand(channelId: string): ApplicationCommandStore.ApplicationCommand | null;
    getActiveCommandSection(channelId: string): ApplicationCommandStore.CommandSection | null;
    getActiveOptionName(channelId: string): string | null;
    getActiveOption(channelId: string): ApplicationCommandStore.CommandOption | undefined;
    getPreferredCommandId(channelId: string): string | null;
    getOptionStates(channelId: string): Record<string, ApplicationCommandStore.OptionState>;
    getOptionState(channelId: string, optionName: string): ApplicationCommandStore.OptionState | undefined;
    getCommandOrigin(channelId: string): string | null;
    getSource(channelId: string): string | undefined;
    getOption(channelId: string, optionName: string): ApplicationCommandStore.CommandOption | undefined;
    getState(channelId: string): ApplicationCommandStore.State;
}
