import { ComponentType } from "react";

export type PlaygroundControl =
    | { type: "select"; label: string; defaultValue?: PropertyKey; options: Array<{ label: string; value: PropertyKey; }>; }
    | { type: "text"; label: string; defaultValue?: string; }
    | { type: "number"; label: string; defaultValue?: number; minValue?: number; }
    | { type: "boolean"; label: string; defaultValue?: boolean; }
    | { type: "slider"; label: string; defaultValue?: number; minValue: number; maxValue: number; }
    | { type: "color"; label: string; defaultValue?: string; };

/** Story is the page defined inside a {@link PlaygroundGroup Group}. */
export interface PlaygroundStory {
    id: PropertyKey;
    name: string;
    /** Renders your story component inside a card */
    component: ComponentType<PropertyDescriptorMap>;
    /** Right side panel that you can customize and use in {@link component} */
    controls?: Record<string, PlaygroundControl>;
    docs?: string;
}

/** Group is a category-like section that has your {@link PlaygroundStory Stories} */
export interface PlaygroundGroup {
    title: string;
    stories: PlaygroundStory[];
}

export interface PlaygroundCollection {
    id: PropertyKey;
    name: string;
    groups: PlaygroundGroup[];
}

/** @ignore this should only be used when patching your own playgrounds. */
export interface PlaygroundConfig {
    /** Collections rendered as sidebar buttons in the playground. They are the main entry to your groups */
    collections: PlaygroundCollection[];
}
