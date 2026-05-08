import { FluxStore } from "..";

export namespace WordFrequencyStore {
    export interface WordFrequencyState {
        wordCounts: Array<[string, number]>;
        wordSketchData?: string;
    }
}

export class WordFrequencyStore extends FluxStore {
    getState(): WordFrequencyStore.WordFrequencyState;
    getMaxWordCount(): number;
    getAllWordsSorted(): Array<[string, number]>;
    isFrequentlyUsedWord(word: string): boolean;
}
