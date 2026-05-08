import { FluxStore } from "..";

export namespace IntegrationQueryStore {
    export interface QueryResult {
        loading: boolean;
        results: Array<{
            type: string;
            meta: any;
        }>;
    }

    export interface Query {
        integration: string;
        query: string;
    }
}

export class IntegrationQueryStore extends FluxStore {
    /** Get query results for an integration and query string */
    getResults(integration: string, query: string): IntegrationQueryStore.QueryResult | null;

    /** Get the current query */
    getQuery(): IntegrationQueryStore.Query;
}
