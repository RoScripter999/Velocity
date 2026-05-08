import { FluxStore } from "..";

export enum DCFEventType {
    DC_SHOWN = 0,
    DC_SHOW_REQUEST = 1,
    DC_DISMISSED = 2,
}

export namespace DCFEventStore {
    export interface DCFEvent {
        eventType: DCFEventType;
        dismissibleContent: any;
    }
}

export class DCFEventStore extends FluxStore {
    /** Get all DCF events */
    getDCFEvents(): DCFEventStore.DCFEvent[];
}
