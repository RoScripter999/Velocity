export interface Embed {
    author?: {
        name: string;
        url: string;
        iconURL: string | undefined;
        iconProxyURL: string | undefined;
        rawName: string;
    };
    color: string | number;
    fields: Array<{
        rawName: string;
        rawValue: string;
        inline: boolean;
    }>;
    footer?: {
        text: string;
        iconURL: string | undefined;
        iconProxyURL: string | undefined;
        rawText: string;
    };
    id: string;
    image?: {
        height: number;
        width: number;
        url: string;
        proxyURL: string;
    };
    provider?: {
        name: string;
        url: string | undefined;
    };
    rawDescription: string;
    rawTitle: string;
    referenceId: unknown;
    timestamp: string;
    thumbnail?: {
        height: number;
        proxyURL: string | undefined;
        url: string;
        width: number;
    };
    type: string;
    url: string | undefined;
    video?: {
        height: number;
        width: number;
        url: string;
        proxyURL: string | undefined;
    };
}

export interface EmbedJSON {
    author?: {
        name?: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    title?: string;
    color?: string | number;
    description?: string;
    type?: string;
    url?: string;
    provider?: {
        name?: string;
        url?: string;
    };
    timestamp?: string;
    footer?: {
        text?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    image?: {
        height?: number;
        width?: number;
        url?: string;
        proxy_url?: string;
    };
    thumbnail?: {
        height?: number;
        width?: number;
        url?: string;
        proxy_url?: string;
    };
    video?: {
        height?: number;
        width?: number;
        url?: string;
        proxy_url?: string;
    };
    fields?: {
        name?: string;
        value?: string;
        inline?: boolean;
    }[];
}
