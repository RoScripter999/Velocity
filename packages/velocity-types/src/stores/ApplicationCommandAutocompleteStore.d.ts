import { FluxStore } from "..";

export interface AutocompleteChoice {
    displayName: string;
    name: string;
    value: string | number;
}

export class ApplicationCommandAutocompleteStore extends FluxStore {
    getLastErrored(channelId: string): boolean;
    getAutocompleteChoices(channelId: string, optionName: string, query: string): AutocompleteChoice[] | undefined;
    getAutocompleteLastChoices(channelId: string, optionName: string): AutocompleteChoice[] | undefined;
    getLastResponseNonce(channelId: string): string | undefined;
}
