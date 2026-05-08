import { FluxStore } from "..";

export class LayerStore extends FluxStore {
    /** Check if there are any layers in the stack */
    hasLayers(): boolean;

    /** Get all layers in the stack */
    getLayers(): any[];
}
