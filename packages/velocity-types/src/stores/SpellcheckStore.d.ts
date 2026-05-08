
import { FluxStore } from "..";

export class SpellcheckStore extends FluxStore {
    hasLearnedWord(word: string): boolean;
    isEnabled(): boolean;
}
