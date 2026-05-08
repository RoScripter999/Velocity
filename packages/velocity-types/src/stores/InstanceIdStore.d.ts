import { FluxStore } from "..";

export class InstanceIdStore extends FluxStore {
    /** Get the unique instance ID */
    getId(): number;
}
